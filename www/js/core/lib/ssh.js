// SSH Connection porting from firessh 0.93.1
define([
  'core/uao/uao_conv',
  'core/lib/paramiko'], function (uaoConv, paramikojs) {

function SshProtocol(bbsCore) {
    this.socket = null;
    this.host = null;
    this.port = 22;

    //this.connectCount = 0;
    this.bbsCore = bbsCore;
    //this.prefs = listener.prefs;

    //this.blockSend = false;

    //this.utf8Buffer=[];

    //this.utf8Buffer='';

    //gPlatform = getPlatform();
    //gCli = new cli(this);
    this.shell = null;
    this.client = null;
    this.privatekey = '';
    this.debug = false;
}

SshProtocol.prototype={
    protocolName: 'ssh',
    //ts: Cc["@mozilla.org/network/socket-transport-service;1"].getService(Ci.nsISocketTransportService),
    //ps: Cc["@mozilla.org/network/protocol-proxy-service;1"].getService(Ci.nsIProtocolProxyService),
    // encoding converter
    //oconv: Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter),

    connect: function(host, port, extData, hostkeys) {
        //alert('connect');

        if(host)
        {
          this.host = host;
          this.port = port;
        }
        this.bbsCore.robot.initialAutoLogin();
        this.isConnected = false;

        var self = this;
        var shell_success = function(shell) {
          self.shell = shell;
        };

        this.client = new paramikojs.SSHClient();
        this.client.set_missing_host_key_policy(new paramikojs.AutoAddPolicy()); //always save new key

        var auth_success = function() {
          self.client.invoke_shell('xterm-256color', self.bbsCore.prefs.bbsCol, self.bbsCore.prefs.bbsRow, shell_success);          console.log('SshProtocol connect - 3-2');
        };

        var write = function(str) {
          if (str) {
            if(!str.length) return;
            self.bbsCore.resetUnusedTime();

            var data = new Uint8Array(str.length);
            for (var i = 0; i < data.length; i++) {
              data[i] = str.charCodeAt(i);
            }
            self.socket.write(data);
          }
        };
        this.sshTransport = this.client.connect(write, auth_success, this.host, this.port, 'bbs', 'bbs', null, this.privatekey, 0, true, false);

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

      //ssh - start
      this.isConnected = false;
      this.client.close(true);
      this.shell = null;
      //ssh - end
    },

    // data listener
    onStartRequest: function(){
      //call by socket event
      if(this.bbsCore)
        this.bbsCore.onConnect(this);
    },

    onStopRequest: function(){
      //call by socket event
      if(this.shell)
        this.close();

      //if(this.bbsCore.abnormalClose == false)
      this.bbsCore.onClose(this);
    },

    onSocketError: function(errorMessage) {
      //call by socket event
    },

    onDataAvailable: function(dataArray) {
        var count = dataArray.length;

        var data='';
        while(count > 0) {
            var s = String.fromCharCode.apply(String, dataArray);
            //console.log(s);
            count -= s.length;
            if(s.length) {
              try {
                this.sshTransport.fullBuffer += s;  // read data
                this.sshTransport.run();
              } catch(ex) {
                //console.log(ex);
                if (ex instanceof paramikojs.ssh_exception.AuthenticationException) {
                  this.client.legitClose = true;
                  return;
                }
              }
              var data = '';
              try {
                if (!this.shell) {
                  return;
                }
                if (this.shell.closed) {
                  this.close();
                  return;
                }
                data = this.shell.recv(65536);
              } catch(ex) {
                if (ex instanceof paramikojs.ssh_exception.WaitException) {
                  // some times no data comes out, dont care
                  continue;
                } else {
                  throw ex;
                }
              }
              if(!this.isConnected) {
                this.isConnected = true;
                var buf = this.bbsCore.buf;
                buf.scroll(false, buf.curY);
                buf.curY = 0;
              }
              if (data) {
                this.bbsCore.onData(this, data);
              }
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
          this.shell.send(str);
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
        var cols = this.bbsCore.prefs.bbsCol; //80;
        var rows = this.bbsCore.prefs.bbsRow; //24;
        this.shell.resize_pty(cols, rows);
    },

    utf8Output: function(str) {
      return unescape(encodeURIComponent(str));
    }
};

return SshProtocol;

});
