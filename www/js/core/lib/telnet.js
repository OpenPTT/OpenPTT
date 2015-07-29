define(['core/uao/uao_conv'], function (uaoConv) {

// Handle Telnet Connections according to RFC 854
// Telnet commands
const SE = '\xf0'
const NOP = '\xf1';
const DATA_MARK = '\xf2';
const BREAK = '\xf3';
const INTERRUPT_PROCESS = '\xf4';
const ABORT_OUTPUT = '\xf5';
const ARE_YOU_THERE = '\xf6';
const ERASE_CHARACTER = '\xf7';
const ERASE_LINE = '\xf8';
const GO_AHEAD  = '\xf9';
const SB = '\xfa';

// Option commands
const WILL  = '\xfb';
const WONT  = '\xfc';
const DO = '\xfd';
const DONT = '\xfe';
const IAC = '\xff';

// Telnet options
const ECHO  = '\x01';
const SUPRESS_GO_AHEAD = '\x03';
const TERM_TYPE = '\x18';
const IS = '\x00';
const SEND = '\x01';
const NAWS = '\x1f';

// state
const STATE_DATA=0;
const STATE_IAC=1;
const STATE_WILL=2;
const STATE_WONT=3;
const STATE_DO=4;
const STATE_DONT=5;
const STATE_SB=6;

function TelnetProtocol(bbsCore) {
    this.socket = null;
    this.host = null;
    this.port = 23;

    //this.connectCount = 0;
    this.bbsCore = bbsCore;
    //this.prefs = bbsCore.prefs;

    this.state=STATE_DATA;
    this.iac_sb='';
    this.debug = false;
    //this.b52k3uao=window.uaotable;
    //this.initial=true;
    //this.utf8Buffer=[];
    //this.blockSend = false;
}

TelnetProtocol.prototype={
    protocolName: 'telnet',
    // transport service
    //ts: Cc["@mozilla.org/network/socket-transport-service;1"].getService(Ci.nsISocketTransportService),
    //ps: Cc["@mozilla.org/network/protocol-proxy-service;1"].getService(Ci.nsIProtocolProxyService),
    // encoding converter
    //oconv: Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter),

    connect: function(host, port) {
      //call by bbsCore
      this.state=STATE_DATA;
      this.iac_sb='';
      //alert('connect');
      if(host)
      {
        this.host = host;
        this.port = port;
      }
      this.bbsCore.robot.initialAutoLogin();
      //this.isConnected = false;
      this.socket = new Socket();
      this.socket.onData = this.onDataAvailable.bind(this);
      this.socket.onError = this.onSocketError.bind(this);
      this.socket.onClose = this.onStopRequest.bind(this);
      this.socket.open(this.host, this.port,
        this.onStartRequest.bind(this),
        this.onSocketError.bind(this)
      );
    },

    close: function() {
      //call by bbsCore
      this.socket.shutdownWrite();
      this.socket.close();
      this.socket = null;
    },

    onStartRequest: function(){
      //call by socket event
      if(this.bbsCore)
        this.bbsCore.onConnect(this);
    },

    onStopRequest: function(hasError){
      //call by socket event
      //if(this.bbsCore.abnormalClose == false)
      this.bbsCore.onClose(this);
    },

    onSocketError: function(errorMessage) {
      //call by socket event
    },

    onDataAvailable: function(dataArray) {
      //call by socket event
        var count = dataArray.length;
        var data='';
        // dump(count + 'bytes available\n');
        while(count > 0) {
            var s = String.fromCharCode.apply(String, dataArray);
            count -= s.length;
            // dump(count + 'bytes remaining\n');
            var n=s.length;
            // this.oconv.charset='big5';
            // dump('data ('+n+'): >>>\n'+ this.oconv.ConvertToUnicode(s) + '\n<<<\n');
            for(var i = 0;i<n; ++i) {
                var ch=s[i];

                switch(this.state) {
                case STATE_DATA:
                    if( ch == IAC ) {
                        if(data) {
                            this.bbsCore.onData(this, data);
                            data='';
                        }
                        this.state = STATE_IAC;
                    }
                    else
                        data += ch;
                    break;
                case STATE_IAC:
                    switch(ch) {
                    case WILL:
                        this.state=STATE_WILL;
                        break;
                    case WONT:
                        this.state=STATE_WONT;
                        break;
                    case DO:
                        this.state=STATE_DO;
                        break;
                    case DONT:
                        this.state=STATE_DONT;
                        break;
                    case SB:
                        this.state=STATE_SB;
                        break;
                    default:
                        this.state=STATE_DATA;
                    }
                    break;
                case STATE_WILL:
                    switch(ch) {
                    case ECHO:
                    case SUPRESS_GO_AHEAD:
                        this.send( IAC + DO + ch );
                        break;
                    default:
                        this.send( IAC + DONT + ch );
                    }
                    this.state = STATE_DATA;
                    break;
                case STATE_DO:
                    switch(ch) {
                    case TERM_TYPE:
                        this.send( IAC + WILL + ch );
                        break;
                    case NAWS:
                        this.send( IAC + WILL + ch );
                        this.sendNaws();
                        break;
                    default:
                        this.send( IAC + WONT + ch );
                    }
                    this.state = STATE_DATA;
                    break;
                case STATE_DONT:
                case STATE_WONT:
                    this.state = STATE_DATA;
                    break;
                case STATE_SB: // sub negotiation
                    this.iac_sb += ch;
                    if( this.iac_sb.slice(-2) == IAC + SE ) {
                        // end of sub negotiation
                        switch(this.iac_sb[0]) {
                        case TERM_TYPE: {
                            // FIXME: support other terminal types
                            var rep = IAC + SB + TERM_TYPE + IS + this.bbsCore.prefs.termType + IAC + SE;
                            this.send( rep );
                            break;
                            }
                        }
                        this.state = STATE_DATA;
                        this.iac_sb = '';
                        break;
                    }
                }
            }
            if(data) {
                this.bbsCore.onData(this, data);
                data='';
            }
        }
    },

    send: function(str) {
        if(!this.socket) return;
        if(this.debug)
          console.log(str);
        if(this.bbsCore)
        {
          this.bbsCore.resetUnusedTime();
          if(!str.length) return;

          var data = new Uint8Array(str.length);
          for (var i = 0; i < data.length; i++) {
            data[i] = str.charCodeAt(i);
          }
          this.socket.write(data);
        }
    },

    convSend: function(unicode_str, charset, extbuf) {
        if(charset.toLowerCase() == 'utf-8') {
            return this.send(this.utf8Output(unicode_str));
        }

        // supports UAO
        var s;
        // when converting unicode to big5, use UAO.
        if(charset.toLowerCase() == 'big5') {
            s = uaoConv.u2b(unicode_str);
        }
        else
        {
            //not support
        }
        if(extbuf) return s;
        if(s)
        {
          s = this.bbsCore.strUtil.ansiHalfColorConv(s);
          this.send(s);
        }
    },

    sendNaws: function() {
        var cols = this.bbsCore.prefs.bbsCol; //80
        var rows = this.bbsCore.prefs.bbsRow; //24
        var naws = String.fromCharCode((cols-(cols%256))/256, cols%256, (rows-(rows%256))/256, rows%256).replace(/(\xff)/g,'\xff\xff');
        var rep = IAC + SB + NAWS + naws + IAC + SE;
        this.send( rep );
    },

    utf8Output: function(str) {
      return unescape(encodeURIComponent(str));
    }
};

return TelnetProtocol;

});

