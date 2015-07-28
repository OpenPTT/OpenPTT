// Terminal Screen Buffer, displayed by TermView
define([
    'core/uao/uao_conv',
    'core/terms/termChar',
    'core/terms/termHtml'], function (uaoConv, TermChar, TermHtml) {

function TermBuf(bbsCore, cols, rows) {
    this.cols=cols;
    this.rows=rows;
    this.bbsCore = bbsCore;
    this.prefs = bbsCore.prefs;
    this.view=null;
    this.cur_x=0;
    this.cur_y=0;
    this.cur_x_sav=-1;
    this.cur_y_sav=-1;
    this.scrollStart=0;
    this.scrollEnd=rows-1;
    this.nowHighlight=-1;
    this.tempMouseCol = 0;
    this.tempMouseRow = 0;
    this.mouseCursor = 0;
    this.useMouseBrowsingPtt = ((document.location.hostname == 'ptt.cc')||(document.location.hostname == 'bbs.ptt.cc')||(document.location.hostname == 'ptt.twbbs.org'));
    //this.scrollingTop=0;
    //this.scrollingBottom=23;
    this.attr=new TermChar(' ');
    this.newChar=new TermChar(' ');

    this.altScreen='';
    this.changed=false;
    this.posChanged=false;
    this.downPostChanged=false;
    this.PageState = 0;
    this.boardName = '';
    this.forceFullWidth=false;
    //this.aidhandler = new Aidhandler();
    this.lines=new Array(rows);
    //this.keyWordLine=new Array(rows);
    this.linesX=new Array(0);
    this.linesY=new Array(0);

    //this.outputhtmls = new Array(rows);
    this.lineChangeds = new Array(rows);

    this.openThreadUrl = 0;
    this.severNotifyStr = '';
    this.colsPerPage = cols;
    this.rowsPerPage = rows;

    while(--rows >= 0) {
        var line=new Array(cols);
        //var outputhtml=new Array(cols);
        var c=cols;
        while(--c >= 0) {
            line[c]=new TermChar(' ');
            //outputhtml[c]= new TermHtml();
        }
        this.lines[rows]=line;
        //this.outputhtmls[rows]=outputhtml;
    }
    this.BBSWin = document.getElementById('BBSWindow');
}

TermBuf.prototype={
    //conv: Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService),
    //timerUpdate: Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer),

    // From: http://snippets.dzone.com/posts/show/452
    //uriRegEx: /(ftp|http|https|telnet):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/ig,
    //uriRegEx: /(ftp|http|https|telnet):\/\/([A-Za-z0-9_]+:{0,1}[A-Za-z0-9_]*@)?([A-Za-z0-9_#!:.?+=&%@!\-\/\$\^,;|*~'()]+)(:[0-9]+)?(\/|\/([A-Za-z0-9_#!:.?+=&%@!\-\/]))?/ig,
    uriRegEx: /((ftp|http|https|telnet|ssh):\/\/([A-Za-z0-9_]+:{0,1}[A-Za-z0-9_]*@)?([A-Za-z0-9_#!:.?+=&%@!\-\/\$\^,;|*~'()]+)(:[0-9]+)?(\/|\/([A-Za-z0-9_#!:.?+=&%@!\-\/]))?)|(pid:\/\/(\d{1,10}))/ig,
    aidRegEx: /#[\w\-]{8}/ig,
    aidWithBoardNameRegEx: /#[\w\-]{8}\((\w{2,12})\)/i,
    aidWithBoardNameRegEx2: /\u203B\u0020\u005B\u672C\u6587\u8F49\u9304\u81EA\u0020(\w{2,12})\u0020\u770B\u677F\u0020(#[\w\-]{8})/,
    //aidWithBoardNameRegEx2: /\u203B\u0020\u005B\u672C\u6587\u8F49\u9304\u81EA\u0020(\w{2,11})\u0020\u770B\u677F\u0020(#[a-zA-Z0-9]{8})\u0020\u005D/,
    //uriRegEx: /http:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9._%-]*)/ig,
    //pttThreadRegEx: /^https?:\/\/www\.ptt\.cc\/bbs\/([A-Za-z0-9\._%-]*)\/([A-Za-z0-9\._%-]*)\.html/ig,

    onResize: function(newcols, newrows) {
        if(newcols>=65535) newcols=65535;
        if(newrows>=65535) newrows=65535;
        if(newrows<this.rows) {
            for(var row=this.rows-1; (row>newrows-1 && row>this.cur_y); --row) {
                this.lines.pop();
                //this.outputhtmls.pop();
            }
            for(row=0; row<this.cur_y-newrows+1; ++row) {
                this.lines.shift();
                //this.outputhtmls.shift();
            }
            if(this.cur_y_sav>=0 && this.cur_y_sav<this.cur_y-newrows+1)
                this.cur_y_sav=0;
            else if(this.cur_y_sav>=0 && this.cur_y>newrows-1)
                this.cur_y_sav-=this.cur_y-newrows+1;
            if(this.cur_y_sav>=newrows) this.cur_y_sav=newrows-1;
            if(this.cur_y>=newrows) this.cur_y=newrows-1;
        } else {
            for(var row=this.rows-1; row<newrows-1; ++row) {
                var line=new Array(this.cols);
                //var outputhtml=new Array(this.cols);
                for(var col=0; col<this.cols; ++col) {
                    line[col]=new TermChar(' ');
                    //outputhtml[col]=new TermHtml();
                }
                this.lines.push(line);
                //this.outputhtmls.push(outputhtml);
            }
        }
        if(newcols<this.cols) {
            if(this.cur_x>newcols) this.cur_x=0;
            if(this.cur_x_sav>newcols) this.cur_x_sav=0;
            for(var row=0; row<newrows; ++row) {
                for(var col=this.cols-1; col>newcols-1; --col) {
                    this.lines[row].pop();
                    //this.outputhtmls[row].pop();
                }
                if(this.lines[row][newcols-1].isLeadByte) {
                    this.lines[row][newcols-1].copyFrom(this.newChar);
                }
            }
        } else {
            for(var row=0; row<newrows; ++row) {
                for(var col=this.cols-1; col<newcols-1; ++col) {
                    var ch=new TermChar(' ');
                    this.lines[row].push(ch);
                    //this.outputhtmls[row].push(new TermHtml());
                }
            }
        }
        if(this.scrollEnd==this.rows-1) this.scrollEnd=newrows-1;
        this.cols=newcols;
        this.rows=newrows;
        this.bbsCore.conn.sendNaws();
        this.updateCharAttr(true); // url is forced updating to aviod overflow
        //if(!skipRedraw) this.view.onResize();
    },

//    setView: function(view, prefs) {
//        this.view = view;
//        this.prefs = prefs;
//    },

    setCol: function(colCount) {
      if(colCount==this.cols)
        return;
      var oldCols = this.cols;
      if(this.view && colCount < oldCols)
        this.view.stopUpdate();

      if(this.view)
        this.view.setCol(colCount);
      this.onResize(colCount, this.rows);

      if(this.view && colCount < oldCols) {
        this.view.startUpdate();
      }
      if(this.view) {
        this.view.fontResize();
        this.view.updateCursorPos();
        this.view.update(true);
      }
    },

    setRow: function(rowCount) {
      if(rowCount==this.rows)
        return;
      var oldRows = this.rows;
      if(this.view && rowCount < oldRows)
        this.view.stopUpdate();

      if(this.view)
        this.view.setRow(rowCount);
      this.onResize(this.cols, rowCount);

      if(this.view && rowCount < oldRows) {
        this.view.startUpdate();
      }
      if(this.view) {
        this.view.fontResize();
        this.view.updateCursorPos();
        this.view.update(true);
      }
    },

    utf8Data: function(str) {
        if(!this.utf8Buffer)
            this.utf8Buffer = '';
        var utf8Str = '';
        var str_trim = str.replace(/[\xC0-\xDF]$/,"").replace(/[\xE0-\xEF][\x80-\xBF]?$/,"").replace(/[\xF0-\xF7][\x80-\xBF]{0,2}$/,"");
        try {
            utf8Str = decodeURIComponent(escape(str_trim));
        } catch(e) {
            if(this.utf8Buffer.length < 3) {
                utf8Str = str; // hiding this may result in disorder of termbuf
            } else {
                try {
                    str_trim = this.utf8Buffer.match(/[\xC0-\xF7][\x80-\xBF]*$/) + str_trim;
                    utf8Str = decodeURIComponent(escape(str_trim));
                } catch(ex) {
                    utf8Str = str;
                }
            }
        }
        this.utf8Buffer += str;
        if(this.utf8Buffer.length > 3)
            this.utf8Buffer = this.utf8Buffer.slice(-3);
        return utf8Str;
    },

    puts: function(str) {
        if(!str)
            return;
        if(this.view && this.view.conn && this.prefs.charset.toLowerCase() == 'utf-8')
            str = this.utf8Data(str);
        var cols=this.cols;
        var rows=this.rows;
        var lines=this.lines;
        var n=str.length;
        var line = lines[this.cur_y];
        for(var i=0;i<n;++i) {
            var ch=str[i];
            switch(ch) {
            case '\x07':
                /*
                TODO: water ball !, we need handle this event.
                */
                continue;
            case '\b':
                this.back();
                continue;
            case '\r':
                this.carriageReturn();
                continue;
            case '\n':
            case '\f':
            case '\v':
                this.lineFeed();
                line = lines[this.cur_y];
                continue;
            case '\0':
                continue;
            }
            //if( ch < ' ')
            //    //dump('Unhandled invisible char' + ch.charCodeAt(0)+ '\n');

            if(this.cur_x >= cols) {
                // next line
                if(!this.prefs.disableLinefeed) this.lineFeed();
                this.cur_x=0;
                line = lines[this.cur_y];
                this.posChanged=true;
            }
            switch(ch) {
            case '\t':
                this.tab();
                break;
            default:
                var ch2 = line[this.cur_x];
                ch2.ch=ch;
                ch2.copyAttr(this.attr);
                ch2.needUpdate=true;
                ++this.cur_x;
                if(ch2.isLeadByte) // previous state before this function
                    line[this.cur_x].needUpdate=true;
                if(this.prefs.charset.toLowerCase() == 'utf-8' && this.isFullWidth(ch) && this.cur_x < cols) {
                    ch2 = line[this.cur_x];
                    ch2.ch='';
                    ch2.copyAttr(this.attr);
                    ch2.needUpdate=true;
                    ++this.cur_x;
                    // assume server will handle mouse moving on full-width char
                }
                this.changed=true;
                this.posChanged=true;
                if(this.openThreadUrl == 2 && this.cur_y == this.rows-1 && this.cur_x == this.cols-1)
                {
                  this.openThreadUrl = 3;
                  this.queueUpdate();
                }
            }
        }
        this.queueUpdate();
    },

    updateCharAttr: function() {
        var cols=this.cols;
        var rows=this.rows;
        var lines=this.lines;
        for(var row=0; row<rows; ++row) {
            var line=lines[row];
            var needUpdate=false;
            for(var col=0; col < cols; ++col) {
                var ch = line[col];
                if(ch.needUpdate)
                    needUpdate=true;
                // all chars > ASCII code are regarded as lead byte of DBCS.
                // FIXME: this is not correct, but works most of the times.
                if( this.isFullWidth(ch.ch) && (col + 1) < cols ) {
                    ch.isLeadByte=true;
                    ++col;
                    var ch0=ch;
                    ch=line[col];
                    if(ch.needUpdate)
                        needUpdate=true;
                    // ensure simutaneous redraw of both bytes
                    if( ch0.needUpdate != ch.needUpdate ) {
                        ch0.needUpdate = ch.needUpdate = true;
                    }
                }
                else if(ch.isLeadByte && (col+1) < cols)
                {
                  var ch2 = line[col+1];
                  ch2.needUpdate=true;
                }
                ch.isLeadByte=false;
            }

            if(needUpdate) { // this line has been changed
                this.lineChangeds[row] = true;
                // perform URI detection again
                // remove all previously cached uri positions
                if(line.uris) {
                    var uris=line.uris;
                    var nuris=uris.length;

                    // FIXME: this is inefficient
                    for(var iuri=0; iuri<nuris;++iuri) {
                        var uri=uris[iuri];
                        line[uri[0]].startOfURL=false;
                        line[uri[0]].endOfURL=false;
                        line[uri[0]].fullurl='';
                        line[uri[0]].boardName='';
                        line[uri[0]].aidc='';
                        line[uri[1]-1].startOfURL=false;
                        line[uri[1]-1].endOfURL=false;
                        line[uri[1]-1].fullurl='';
                        line[uri[1]-1].boardName='';
                        line[uri[1]-1].aidc='';
                        for(col=uri[0]; col < uri[1]; ++col)
                        {
                            line[col].partOfURL=false;
                            line[col].needUpdate=true;
                        }
                    }
                    line.uris=null;
                }
                var s='';
                for(var col=0; col < cols; ++col)
                    s+=line[col].ch;
                if(this.prefs.charset.toLowerCase() != 'utf-8')
                    s=s.replace(/[^\x00-\x7f]./g,'\xab\xcd');
                else {
                    var str='';
                    for(var i=0; i<s.length; ++i) {
                        str+=s.charAt(i);
                        if(this.isFullWidth(s.charAt(i)))
                            str+=s.charAt(i);
                    }
                    s=str;
                }
                var res;
                var uris=null;
                // pairs of URI start and end positions are stored in line.uri.
                while( (res=this.uriRegEx.exec(s)) != null ) {
                    if(!uris)
                      uris=new Array();
                    var uri=[res.index, res.index+res[0].length];
                    uris.push(uri);
                    //console.log('found URI: ' + res[0]);
                }

                /*
                TODO: aid detect
                if(this.prefs.aidAction!=0) {
                  while( (res=this.aidRegEx.exec(s)) != null ) {
                    if(!uris)
                      uris=new Array();
                    var uri=[res.index, res.index+res[0].length];
                    uris.push(uri);
                    //console.log('found AID: ' + res[0]);
                  }
                }
                */

                //if(this.bbsCore.robot.autoLoginStage == 4)
                //  this.bbsCore.robot.checkLoginStatus(row);
                if(this.bbsCore.robot.autoLoginStage > 0)
                  this.bbsCore.robot.checkAutoLogin(row);
                //else
                //  this.bbsCore.robot.checkTask();

                //if(this.openThreadUrl==1) //open therad URL, this code only for desktop browser.
                //{
                //    var text = this.getRowText(row, 0, this.cols);
                //    if(text.indexOf(this.PTTZSTR0)>=0)
                //    {
                //      this.openThreadUrl = 2;
                //      this.view.conn.backgroundSend(' ');
                //      this.view.showAlertMessageEx(false, true, false, this.view.bbscore.getLM('noThreadUrl'));
                //    }
                //}

                if(uris) {
                    line.uris=uris;
                    // dump(line.uris.length + "uris found\n");
                }
                //
                if(line.uris) {
                    var uris=line.uris;
                    var nuris=uris.length;
                    for(var iuri=0; iuri<nuris;++iuri) {
                        var uri=uris[iuri];
                        var urlTemp = '';
                        var lineStrAfterLink = '';
                        var lineStrBeforeLink = '';

                        for(col=uri[0]; col < uri[1]; ++col)
                        {
                          urlTemp+=line[col].ch;
                          line[col].partOfURL=true;
                          line[col].needUpdate=true; //fix link bug
                        }
                        lineStrAfterLink = this.getText(row, uri[0], cols-1, false); //urlTemp;
                        lineStrAfterLink = lineStrAfterLink.replace(/\s/g,'');
                        lineStrBeforeLink = this.getText(row, 0, uri[1], false); //urlTemp;
                        var u;
                        if(this.prefs.charset.toLowerCase() != 'utf-8')
                          u = uaoConv.b2u(urlTemp);
                        else {
                          var str='';
                          for(var i=0; i<urlTemp.length; ++i) {
                            str+=urlTemp.charAt(i);
                            if(this.isFullWidth(urlTemp.charAt(i)))
                              str+=urlTemp.charAt(i);
                          }
                          u=str;
                        }
                        var addUrl = true;
                        var urlTemp2 = urlTemp.toLowerCase();
                        //line[uri[0]].startOfURL=true;
                        /* pid && aid handle
                        if(urlTemp2.substr(0,6)=='pid://') {
                          line[uri[0]].fullurl='http://www.pixiv.net/member_illust.php?mode=big&illust_id='+urlTemp2.substr(6,15);
                        } else if(urlTemp.substr(0,1)=='#') {
                          //transfrom aid to url
                          var aidc = urlTemp.substr(1);
                          var inlineBoardName = '';
                          if(this.aidWithBoardNameRegEx.test(lineStrAfterLink)) {
                            inlineBoardName = lineStrAfterLink.split(this.aidWithBoardNameRegEx)[1];
                            //console.log('inlineBoardName = ' + inlineBoardName);
                          } else if(this.aidWithBoardNameRegEx2.test(lineStrBeforeLink)) {
                            var splits = lineStrBeforeLink.split(this.aidWithBoardNameRegEx2);
                            if(splits[2] == urlTemp)
                              inlineBoardName = splits[1];
                            //console.log('inlineBoardName = ' + inlineBoardName);
                          }
                          //TODO: use aidWithBoardNameRegEx to find boardName in this line.
                          //1. copy from boardName #aidc
                          //2. #aidc (boardName)
                          if(inlineBoardName!='') {
                            line[uri[0]].fullurl=this.aidhandler.pttArticleUrlFromAidc(aidc, inlineBoardName);
                            line[uri[0]].boardName=inlineBoardName;
                          } else if(this.boardName!='') {
                            line[uri[0]].fullurl=this.aidhandler.pttArticleUrlFromAidc(aidc, this.boardName);
                            line[uri[0]].boardName=this.boardName;
                          } else {
                            addUrl = false;
                          }
                          line[uri[0]].aidc=aidc;
                        } else if(this.openThreadUrl==1 && this.pttThreadRegEx.test(urlTemp2)) {
                            line[uri[0]].fullurl=u;
                            //open therad URL, this code only for desktop browser.
                            //this.openThreadUrl = 2;
                            //this.view.conn.backgroundSend(' ');
                            //bbsfox.sendCoreCommand({command: "openNewTabs", charset: this.prefs.charset, ref: null, loadInBg: true, urls:[u]});
                        }
                        else
                        */
                        {
                          //var g = encodeURI(u);
                          //line[uri[0]].fullurl=g;
                          line[uri[0]].fullurl=u;
                        }
                        if(addUrl) {
                          line[uri[0]].startOfURL=true;
                          line[uri[1]-1].endOfURL=true;
                        } else {
                          line[uri[0]].startOfURL=false;
                          line[uri[1]-1].endOfURL=false;
                        }
                        //line[uri[1]-1].needUpdate=true; //fix link bug, some wee need update 2 byte(this byte and prevous byte)
                        //for(col=uri[0]; col < uri[1]; ++col)
                        //  line[col].fullurl=g;
                    }
                }
                //
            }
        }
    },

    clear: function(param) {
        var rows=this.rows;
        var cols=this.cols;
        var lines=this.lines;

        switch(param) {
        case 0:
            var line = lines[this.cur_y];
            var col, row;
            for(col=this.cur_x; col< cols; ++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
            for(row=this.cur_y; row < rows; ++row) {
                line = lines[row];
                for(col=0; col< cols; ++col) {
                    line[col].copyFrom(this.newChar);
                    line[col].needUpdate=true;
                }
            }
            break;
        case 1:
            var line;
            var col, row;
            for(row=0; row < this.cur_y; ++row) {
                line = lines[row];
                for(col=0; col< cols; ++col) {
                    line[col].copyFrom(this.newChar);
                    line[col].needUpdate=true;
                }
            }
            line = lines[this.cur_y];
            for(col=0; col< this.cur_x; ++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
            break;
        case 2:
            while(--rows >= 0) {
                var col=cols;
                var line=lines[rows];
                while(--col >= 0) {
                    line[col].copyFrom(this.newChar);
                    line[col].needUpdate=true;
                }
            }
            break;
        }
        this.changed=true;
        this.gotoPos(0, 0);
        this.queueUpdate();
    },

    back: function() {
        if(this.cur_x>0) {
            --this.cur_x;
            this.posChanged=true;
            this.queueUpdate();
        }
    },

    tab: function(param) {
        var mod = this.cur_x % 4;
        this.cur_x += 4 - mod;
        if(param > 1) this.cur_x += 4 * (param-1);
        if(this.cur_x >= this.cols)
            this.cur_x = this.cols-1;
        this.posChanged=true;
        this.queueUpdate();
    },

    backTab: function(param) {
        var mod = this.cur_x % 4;
        this.cur_x -= (mod>0 ? mod : 4);
        if(param > 1) this.cur_x -= 4 * (param-1);
        if(this.cur_x < 0)
            this.cur_x = 0;
        this.posChanged=true;
        this.queueUpdate();
    },

    insert: function(param) {
        var line = this.lines[this.cur_y];
        var cols = this.cols;
        var cur_x = this.cur_x;
        if(cur_x>0 && line[cur_x-1].isLeadByte) ++cur_x;
        if(cur_x == cols) return;
        if(cur_x+param >= cols) {
            for(var col=cur_x; col<cols; ++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
        } else {
            while(--param >= 0) {
                var ch=line.pop();
                line.splice(cur_x,0,ch);
                ch.copyFrom(this.newChar);
            }
            for(var col=cur_x; col<cols; ++col)
                line[col].needUpdate=true;
        }
        this.changed=true;
        this.queueUpdate();
    },

    del: function(param) {
        var line = this.lines[this.cur_y];
        var cols = this.cols;
        var cur_x = this.cur_x;
        if(cur_x>0 && line[cur_x-1].isLeadByte) ++cur_x;
        if(cur_x == cols) return;
        if(cur_x+param >= cols) {
            for(var col=cur_x; col<cols; ++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
        } else {
            var n = cols-cur_x-param;
            while(--n >= 0)
                line.splice(cur_x,0,line.pop());
            for(var col=cols-param; col<cols; ++col)
                line[col].copyFrom(this.newChar);
            for(var col=cur_x; col<cols; ++col)
                line[col].needUpdate=true;
        }
        this.changed=true;
        this.queueUpdate();
    },

    eraseChar: function(param) {
        var line = this.lines[this.cur_y];
        var cols = this.cols;
        var cur_x = this.cur_x;
        if(cur_x>0 && line[cur_x-1].isLeadByte) ++cur_x;
        if(cur_x == cols) return;
        var n = (cur_x+param > cols) ? cols : cur_x+param;
        for(var col=cur_x; col<n; ++col) {
            line[col].copyFrom(this.newChar);
            line[col].needUpdate=true;
        }
        this.changed=true;
        this.queueUpdate();
    },

    eraseLine: function(param) {
        var line = this.lines[this.cur_y];
        var cols = this.cols;
        switch(param) {
        case 0: // erase to rigth
            for(var col=this.cur_x;col < cols;++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
            break;
        case 1: //erase to left
            var cur_x = this.cur_x;
            for(var col=0;col < cur_x;++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
            break;
        case 2: //erase all
            for(var col=0;col < cols;++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
            break;
        default:
            return;
        }
        this.changed=true;
        this.queueUpdate();
    },

    deleteLine: function(param) {
        var scrollStart=this.scrollStart;
        this.scrollStart=this.cur_y;
        this.scroll(false, param);
        this.scrollStart=scrollStart;
        this.changed=true;
        this.queueUpdate();
    },

    insertLine: function(param) {
        var scrollStart=this.scrollStart;
        if(this.cur_y < this.scrollEnd) {
            this.scrollStart=this.cur_y;
            this.scroll(true, param);
        }
        this.scrollStart=scrollStart;
        this.changed=true;
        this.queueUpdate();
    },

    scroll: function(up, n) {
        var scrollStart=this.scrollStart;
        var scrollEnd=this.scrollEnd;
        if(scrollEnd<=scrollStart) {
            scrollStart=0;
            if(scrollEnd<1) scrollEnd=this.rows-1;
        }
        if(n>=this.rows) // scroll more than 1 page = clear
            this.clear(2)
        else if(n >= scrollEnd-scrollStart+1) {
            for(row=scrollStart; row <= scrollEnd; ++row) {
                for(col=0; col< cols; ++col) {
                    lines[row][col].copyFrom(this.newChar);
                    lines[row][col].needUpdate=true;
                }
            }
        } else {
            var lines=this.lines;
            var rows=this.rows;
            var cols=this.cols;

            if(up) { // move lines down
                for(i=0; i<rows-1-scrollEnd; ++i)
                    lines.unshift(lines.pop());
                while(--n >= 0) {
                    var line=lines.pop();
                    lines.splice(rows-1-scrollEnd+scrollStart,0,line);
                    for(var col=0; col < cols;++col)
                        line[col].copyFrom(this.newChar);
                }
                for(i=0; i<rows-1-scrollEnd; ++i)
                    lines.push(lines.shift());
            }
            else { // move lines up
                for(i=0; i<scrollStart; ++i)
                    lines.push(lines.shift());
                while(--n >= 0) {
                    var line=lines.shift();
                    lines.splice(scrollEnd-scrollStart,0,line);
                    for(var col=0; col < cols;++col) // clear the line
                        line[col].copyFrom(this.newChar);
                }
                for(i=0; i<scrollStart; ++i)
                    lines.unshift(lines.pop());
            }

            // update the whole screen within scroll region
            for(var row=scrollStart;row<=scrollEnd;++row) {
                var line=lines[row];
                for(var col=0;col<cols;++col) {
                    line[col].needUpdate=true;
                }
            }
        }
        this.changed=true;
        this.queueUpdate();
    },

    gotoPos: function(x,y) {
        // dump('gotoPos: ' + x + ', ' + y + '\n');
        if(x >= this.cols) x = this.cols-1;
        if(y >= this.rows) y = this.rows-1;
        if(x < 0) x = 0;
        if(y < 0) y = 0;
        this.cur_x = x;
        this.cur_y = y;
        this.posChanged=true;
        this.queueUpdate();
    },

    carriageReturn: function() {
        this.cur_x = 0;
        this.posChanged=true;
        this.queueUpdate();
    },

    lineFeed: function() {
        if(this.cur_y < this.scrollEnd) {
            ++this.cur_y;
            this.posChanged=true;
            this.queueUpdate();
        }
        else { // at bottom of screen
            this.scroll(false, 1);
        }
        /* TODO: fix this for mobile viewer, easy reading mode.
        var downloadArticle = this.view.bbscore.robot.downloadArticle;
        if(downloadArticle.isDownloading())
            downloadArticle.getLineFeed();
        */
    },


    queueUpdate: function(directupdate) {
        this.notify();
        //this.timerUpdate.cancel();
        //if(directupdate)
        //  this.timerUpdate.initWithCallback(this, 1, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
        //else
        //  this.timerUpdate.initWithCallback(this, this.prefs.viewBufferTimer, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    },


    notify: function() {
      /*
      //open therad URL, this code only for desktop browser.
      if(this.openThreadUrl == 1)
      {
        if(this.changed)
          this.updateCharAttr();
        return;
      }
      else if(this.openThreadUrl == 2)
      {
        return;
      }
      */

      if(this.changed){ // content changed
        //if(this.prefs.useMouseBrowsing || this.prefs.testPttThread || this.prefs.aidAction!=0){
          this.SetPageState();
          //this.resetMousePos();
        //}
        this.updateCharAttr();
        if(this.view) {
          /*
          //open therad URL, this code only for desktop browser.
          if(this.openThreadUrl == 3)
          {
            this.view.conn.blockSend = false;
            this.openThreadUrl = 0;
            this.view.update(true);
          }
          else
          */
            this.view.update(false);
        }
        this.changed=false;
        this.downPostChanged=true;
      }

      if(this.posChanged) { // cursor pos changed
        if(this.view) {
          this.view.updateCursorPos();
        }
        this.posChanged=false;
      }

      if(this.view && this.view.blinkOn){
        this.view.blinkOn=false;
        this.view.blinkShow=!this.view.blinkShow;
        //
        var allBlinkSpan = document.getElementsByTagName('x');
        for (var i = 0; i < allBlinkSpan.length; i++)
        {
          var c = (this.view.blinkShow && this.view.doBlink)? allBlinkSpan[i].getAttribute("h") : allBlinkSpan[i].getAttribute("s");
          allBlinkSpan[i].parentNode.setAttribute("class", c);
        }
      }
    },

    getText: function(row, colStart, colEnd, color, isutf8, reset) {
      var text = this.lines[row];
      // always start from leadByte, and end at second-byte of DBCS.
      // Note: this might change colStart and colEnd. But currently we don't return these changes.
      if(colStart == this.cols) return '';
      if( colStart > 0 ){
        if( !text[colStart].isLeadByte && text[colStart-1].isLeadByte ) colStart--;
      }
      else colStart = 0;
      if( colEnd > 0 ){
        if( text[colEnd-1].isLeadByte ) colEnd++;
      }
      else colEnd = this.cols;
      if(colStart >= colEnd) return '';

      var charset = this.prefs.charset;

      // generate texts with ansi color
      if(color) {
        var output = this.ansiCmp(this.newChar, text[colStart], reset);
        for(var col=colStart; col<colEnd-1; ++col) {
          if(isutf8 && text[col].isLeadByte && this.ansiCmp(text[col], text[col+1]))
            output += this.ansiCmp(text[col], text[col+1]).replace(/m$/g, ';50m') + text[col].ch;
          else
            output += text[col].ch + this.ansiCmp(text[col], text[col+1]);
        }
        output += text[colEnd-1].ch + this.ansiCmp(text[colEnd-1], this.newChar);
        return (isutf8 && charset != 'UTF-8' ? uaoConv.b2u(output) : output);
      }

      text = text.slice(colStart, colEnd);
      return text.map( function(c, col, line){
        if(!c.isLeadByte) {
          if(col >=1 && line[col-1].isLeadByte) { // second byte of DBCS char
            var prevC = line[col-1];
            var b5 = prevC.ch + c.ch;
            if(charset == 'UTF-8' || b5.length == 1)
              return b5;
            else
              return uaoConv.b2u(b5);
          }
          else
            return c.ch;
        }
      }).join('');
    },

    getColorArray: function(row, colStart, colEnd) {
      var fgColorArray = [];
      var bgColorArray = [];
      var lines = this.lines;
      var line = lines[row];
      for(var i=colStart;i<colEnd;++i) {
      	fgColorArray.push(line[i].getFg());
      	bgColorArray.push(line[i].getBg());
      }
      return {fgColorArray: fgColorArray, bgColorArray: bgColorArray};
    },

    getPosFgColor: function(row, col) {
      return this.lines[row].getFg();
    },

    getPosBgColor: function(row, col) {
      return this.lines[row].getBg();
    },

    findText: function(text, searchrow) {
      var result = {col: -1, row: -1}
      var searchStart = 0;
      var searchEnd = this.cols - 1;
      if(searchrow>=0) searchStart = searchEnd = searchrow;
      for(var row=searchStart; row<=searchEnd; ++row) {
        var line = this.getText(row, 0, this.cols, false, true);
        result.col = line.indexOf(text);
        if(result.col >= 0) {
          result.row = row;
          break;
        }
      }
      return result;
    },

    getRowText: function(row, colStart, colEnd) {
      var text = this.lines[row];
      // always start from leadByte, and end at second-byte of DBCS.
      // Note: this might change colStart and colEnd. But currently we don't return these changes.
      if( colStart > 0 ){
        if( !text[colStart].isLeadByte && text[colStart-1].isLeadByte ) colStart--;
      }
      else colStart = 0;
      if( colEnd < this.cols ){
        if( text[colEnd].isLeadByte ) colEnd++;
      }
      else colEnd = this.cols;
      text = text.slice(colStart, colEnd);
      var charset = this.prefs.charset;
      return text.map( function(c, col, line){

        if(!c.isLeadByte) {
          if(col >=1 && line[col-1].isLeadByte) { // second byte of DBCS char
            var prevC = line[col-1];
            var b5 = prevC.ch + c.ch;
            if(charset == 'UTF-8' || b5.length == 1)
              return b5;
            else
              return uaoConv.b2u(b5);
          }
          else
            return c.ch;
        }
      }).join('');
    },
    /*
    parseText: function(text) {
      var strs = text.split('^');
      var returnStr = strs[0];
      for(var i=1; i<strs.length; ++i) {
        if(strs[i].length > 0) {
          returnStr += String.fromCharCode(strs[i].charCodeAt(0) - 64);
          returnStr += strs[i].substr(1);
        } else if(i<strs.length-1) {
          returnStr += '^' + strs[++i];
        } else returnStr += '^';
      }
      return returnStr;
    },
    */
    ansiCmp: function(preChar, thisChar, forceReset) {
      var text = '';
      var reset = forceReset;
      if((preChar.bright && !thisChar.bright) ||
         (preChar.underLine && !thisChar.underLine) ||
         (preChar.blink && !thisChar.blink) ||
         (preChar.invert && !thisChar.invert)) reset = true;
      if(reset) text = ';';
      if((reset || !preChar.bright) && thisChar.bright) text += '1;';
      if((reset || !preChar.underLine) && thisChar.underLine) text += '4;';
      if((reset || !preChar.blink) && thisChar.blink) text += '5;';
      if((reset || !preChar.invert) && thisChar.invert) text += '7;';
      var DeFg = TermChar.defaultFg;
      var DeBg = TermChar.defaultBg;
      var thisFg = (thisChar.fg == -1) ? DeFg : thisChar.fg;
      var preFg = (preChar.fg == -1) ? DeFg : preChar.fg;
      var thisBg = (thisChar.bg == -1) ? DeBg : thisChar.bg;
      var preBg = (preChar.bg == -1) ? DeBg : preChar.bg;
      if(reset ? (thisFg != DeFg) : (preFg != thisFg))
        text += '3' + thisFg + ';';
      if(reset ? (thisBg != DeBg) : (preBg != thisBg))
        text += '4' + thisBg + ';';
      if(!text) return '';
      else return ('\x1b[' + text.substr(0,text.length-1) + 'm');
    },

    isFullWidth: function(str) {
      var code = str.charCodeAt(0);
      if(this.prefs.charset != 'UTF-8' || this.forceFullWidth) { // PTT support
        if(code > 0x7f) return true;
        else return false;
      }
      if((code >= 0x1100 && code <= 0x115f)
      || (code >= 0x2329 && code <= 0x232a)
      || (code >= 0x2e80 && code <= 0x303e)
      || (code >= 0x3040 && code <= 0xa4cf)
      || (code >= 0xac00 && code <= 0xd7a3)
      || (code >= 0xf900 && code <= 0xfaff)
      || (code >= 0xfe30 && code <= 0xfe6f)
      || (code >= 0xff00 && code <= 0xff60)
      || (code >= 0xffe0 && code <= 0xffe6)) {
        return true;
      } else {
        return false;
      }
    },

    detectColsRows: function() {
      if(this.rows == 24 && this.cols == 80) {
        this.rowsPerPage == 24;
        this.colsPerPage == 80;
        return;
      }
      for(var row = this.rows-1; row >= 0; --row) {
        if(!this.isLineEmpty(row)) break;
      }
      if(row < 23) row = this.rows-1; // set to default
      this.rowsPerPage = row + 1;
      var maxcols = 0;
      for(var row = this.rowsPerPage-1; row >=0; --row) {
        var line = this.lines[row];
        for(var col = this.cols-1; col >= 0; --col) {
          if(line[col].ch != ' ' || line[col].getBg()) break;
        }
        if(col > maxcols) maxcols = col;
      }
      if(maxcols < 79) maxcols = this.cols-1; // set to default
      this.colsPerPage = maxcols + 1;
    },

    SetPageState: function() {
      this.detectColsRows();
      var lastPageState = this.PageState;
      this.PageState = 0; //NORMAL
      var cols = Math.round(this.colsPerPage / 2) * 2; //default: 80
      var rows = this.rowsPerPage;                     //default: 24

      if( this.IsUnicolor(0, 0, cols/2 - 11) && this.IsUnicolor(0, cols/2 + 20, cols-10) ) {
        //lineindex = 2;
        if(this.IsUnicolor(2, 0, cols-10) && !this.isLineEmpty(1) && (this.cur_x<19 || this.cur_y==rows-1)) {
          //document.getElementById('testdata1').innerHTML = "PageState = 2(LIST)";
          this.PageState = 2; // LIST
        } else {
          if(this.useMouseBrowsingPtt) {
            if(this.isLineEmpty(rows-2) && this.isPttZArea() && (this.cur_x<19 || this.cur_y==rows-1)) {
              this.PageState = 4; // PTT-Z
            } else
              this.PageState = 1; // MENU
          } else
            this.PageState = 1; // MENU
        }
      } else {
        //lineindex = 23;
        if( this.IsUnicolor(rows-1, 28, cols-27) && this.cur_y==rows-1) {
          //document.getElementById('testdata1').innerHTML = "PageState = 3(READING)";

          if(this.prefs.aidAction!=0 && lastPageState == 2) { //try to get boardName
            var end = 0;
            var start = 0;
            for(var i=cols-2;i>=cols-16;--i) {
              var ch = this.lines[0][i].ch;
              var ch2 = this.lines[0][i+1].ch;
              if(end == 0 && ch!=' ' && ch2==' ') {
                end = i;
              } if(end != 0 && ch==' ' && ch2!=' ')  {
                start = i+1;
                break;
              }
            }
            this.boardName = '';
            if(start>0 && end>0 && end-start<=11) {
              for(var i=start;i<=end;++i) {
                this.boardName += this.lines[0][i].ch;
              }
              //console.log('this.boardName = ' + this.boardName);
            }
          }

          this.PageState = 3; // READING
        }
      }
      if(this.PageState == 0) {
        //document.getElementById('testdata1').innerHTML = "PageState = 0(NORMAL)";
      }
    },

    isPttZArea: function() {
        var rows = this.rowsPerPage; //default: 24
        var lines = this.lines;
        if(this.prefs.charset != 'UTF-8')
        {
          var line = lines[0];
          var PTTstr1 = '\xa1\x69\xba\xeb\xb5\xd8\xa4\xe5\xb3\xb9\xa1\x6a';
          for(var i = 0; i <= 11; ++i) {
            if(line[i].ch != PTTstr1.charAt(i))
              return false;
          }
          line = lines[rows-1];
          var PTTstr2 = '\xa1\x69\xa5\x5c\xaf\xe0\xc1\xe4\xa1\x6a';
          for(var i = 1; i <= 10; ++i) {
            if(line[i].ch != PTTstr2.charAt(i-1))
              return false;
          }
        }
        else
        {
          var line = lines[0];
          var PTTstr = '';
          for(var i = 0; i <= 11; i+=2) {
            PTTstr+=line[i].ch;
          }
          if(PTTstr!=this.PTTZSTR1)
            return false;
          line = lines[rows-1];
          PTTstr = '';
          for(var i = 1; i <= 10; i+=2) {
            PTTstr+=line[i].ch;
          }
          if(PTTstr!=this.PTTZSTR2)
            return false;
        }
        return true;
    },

    isPttThread: function() {
        var rows = this.rowsPerPage; //default: 24
        var lines = this.lines;
        if(this.prefs.charset.toLowerCase() != 'utf-8')
        {
          var line = lines[1];
          var PTTstr1 = '\x5b\xa1\xf6\x5d\xc2\xf7\xb6\x7d\x20\x5b\xa1\xf7\x5d\xbe\x5c\xc5\xaa';
          for(var i = 0; i <= 16; ++i) {
            if(line[i].ch != PTTstr1.charAt(i))
              return false;
          }
          line = lines[rows-1];
          var PTTstr2 = '\xa4\xe5\xb3\xb9\xbf\xef\xc5\xaa';
          for(var i = 1; i <= 8; ++i) {
            if(line[i].ch != PTTstr2.charAt(i-1))
              return false;
          }
        }
        else
        {
          var line = lines[rows-1];
          PTTstr = '';
          for(var i = 1; i <= 8; i+=2) {
            PTTstr+=line[i].ch;
          }
          if(PTTstr!=this.PTTZSTR4)
            return false;
        }
        return true;
    },

    isPttReading: function() {
        var rows = this.rowsPerPage; //default: 24
        var lines = this.lines;
        if(this.prefs.charset.toLowerCase() != 'utf-8')
        {
          var line = lines[rows-1];
          var PTTstr2 = '\xc2\x73\xc4\xfd';
          for(var i = 2; i <= 5; ++i) {
            if(line[i].ch != PTTstr2.charAt(i-2))
              return false;
          }
        }
        else
        {
          var line = lines[rows-1];
          PTTstr = '';
          for(var i = 2; i <= 5; i+=2) {
            PTTstr+=line[i].ch;
          }
          if(PTTstr!=this.PTTZSTR5)
            return false;
        }
        return true;
    },

    IsUnicolor: function(lineindex, start, end){
      var lines = this.lines;
      var line = lines[lineindex];
      var clr = line[start].getBg();

      // a dirty hacking, because of the difference between maple and firebird bbs.
      for ( var i = start; i < end; i++)
      {
        var clr1 = line[i].getBg();
        if (clr1 != clr || clr1 == 0)
          return false;
      }
      return true;
    },

    isLineEmpty: function(iLine){
      var rows=this.rows;
      var lines=this.lines;
      var line=lines[iLine];

      for( var col = 0; col < this.cols; col++ )
        if(line[col].ch != ' ' || line[col].getBg() )
          return false;
      return true;
    }
    /*
    onMouse_move: function(tcol, trow, doRefresh){
      if(this.openThreadUrl != 0)
        return;
      this.tempMouseCol = tcol;
      this.tempMouseRow = trow;

      if(this.nowHighlight !=  trow || doRefresh) {
        if(this.nowHighlight!=-1) {
          this.clearHighlight();
        }
      }

      var cols = this.colsPerPage; //default: 80
      var rows = this.rowsPerPage; //default: 24

      if (this.prefs.useMouseBrowsing) {
        switch(this.PageState)
        {
        case 0: //NORMAL
          //SetCursor(m_ArrowCursor);
          //m_CursorState = 0;
          this.mouseCursor = 0; //null(back)
          break;
        case 4: //LIST
          if (trow>1 && trow < rows-2)
          {              //m_pTermData->m_RowsPerPage-1
            if ( tcol <= 6 ) //back
            {
              this.mouseCursor = 1;
              if(this.nowHighlight!=-1)
                this.clearHighlight();
              //SetCursor(m_ExitCursor);m_CursorState=1;
            }
            else if ( tcol >= cols-16 )
            {            //m_pTermData->m_ColsPerPage-16
              if ( trow > rows/2 ) //pagedown
                this.mouseCursor = 3;
              else //pageup
                this.mouseCursor = 2;
              if(this.nowHighlight!=-1)
                this.clearHighlight();
            }
            else
            {
              if(this.nowHighlight!=trow)
              {
                if( !this.isLineEmpty(trow)) //list item
                {
                  this.mouseCursor = this.prefs.handPointerCursor ? 6 : 7;
                  this.nowHighlight=trow;
                  if(this.prefs.highlightCursor)
                  {
                    var rows=this.rows;
                    var lines=this.lines;
                    var line=lines[this.nowHighlight];
                    for(var i=0; i<this.cols; ++i)
                      line[i].needUpdate = true;
                    this.updateCharAttr();
                    this.view.update(false);
                  }
                  //document.getElementById('testdata4').innerHTML = "hightlight = "+trow;
                }
                else
                  this.mouseCursor = 11;
              }
            }
          }
          else if ( trow==1 || trow==2 ) //pageup
          {
            this.mouseCursor = 2;
          }
          else if ( trow==0 ) //home
          {
            this.mouseCursor = 4;
          }
          else// if ( trow == rows-1) //end
          {
            this.mouseCursor = 5;
          }
          break;
        case 2: //LIST
          if ( trow>2 && trow < rows-1)
          {              //m_pTermData->m_RowsPerPage-1
            if ( tcol <= 6 ) //back
            {
              this.mouseCursor = 1;
              if(this.nowHighlight!=-1)
                this.clearHighlight();
              //SetCursor(m_ExitCursor);m_CursorState=1;
            }
            else if ( tcol >= cols-16 )
            {            //m_pTermData->m_ColsPerPage-16
              if ( trow > rows/2 ) //pagedown
                this.mouseCursor = 3;
              else //pageup
                this.mouseCursor = 2;
              if(this.nowHighlight!=-1)
                this.clearHighlight();
            }
            else
            {
              if(this.nowHighlight!=trow)
              {
                if( !this.isLineEmpty(trow)) //list item
                {
                  this.mouseCursor = this.prefs.handPointerCursor ? 6 : 7;
                  this.nowHighlight=trow;
                  if(this.prefs.highlightCursor)
                  {
                    var rows=this.rows;
                    var lines=this.lines;
                    var line=lines[this.nowHighlight];
                    for(var i=0; i<this.cols; ++i)
                      line[i].needUpdate = true;
                    this.updateCharAttr();
                    this.view.update(false);
                    var _this = this;
                    this.view.setHighlightTimeout(function(){
                      _this.clearHighlight();
                    });
                  }
                  //document.getElementById('testdata4').innerHTML = "hightlight = "+trow;
                }
                else
                  this.mouseCursor = 11;
              }
            }
          }
          else if ( trow==1 || trow==2 )
          {
            if(this.prefs.useMouseBrowsingEx)
            {
              if ( tcol <2 )//[
                this.mouseCursor = 8;
              else if ( tcol >cols-5 )//]
                this.mouseCursor = 9;
              else //pageup
                this.mouseCursor = 2;
            }
            else //pageup
              this.mouseCursor = 2;
          }
          else if ( trow==0 )
          {
            if(this.prefs.useMouseBrowsingEx)
            {
              if ( tcol <2 )//=
                this.mouseCursor = 10;
              else if ( tcol >cols-5 )//]
                this.mouseCursor = 9;
              else //home
                this.mouseCursor = 4;
            }
            else //home
              this.mouseCursor = 4;
          }
          else// if ( trow == rows-1)
          {
            if(this.prefs.useMouseBrowsingEx)
            {
              if ( tcol <2 ) //refresh
                this.mouseCursor = 12;
              else if ( tcol >cols-5 ) //last post
                this.mouseCursor = 13;
              else //end
                this.mouseCursor = 5;
            }
            else //end
              this.mouseCursor = 5;
          }
          break;
        case 3: //READING
          if ( trow == rows-1)
          {
            if(this.prefs.useMouseBrowsingEx)
            {
              if ( tcol <2 )//]
                this.mouseCursor = 12;
              else if ( tcol >cols-5 ) //last post
                this.mouseCursor = 14;
              else //end
                this.mouseCursor = 5;
            }
            else //end
              this.mouseCursor = 5;
          }
          else if ( trow == 0)
          {
            if(this.prefs.useMouseBrowsingEx)
            {
              if(tcol<2)//=
                this.mouseCursor = 10;
              else if ( tcol >cols-5 )//]
                this.mouseCursor = 9;
              else if ( tcol<7 ) //back
                this.mouseCursor = 1;
              else //pageup
                this.mouseCursor = 2;
            }
            else
            {
              if ( tcol<7 ) //back
                this.mouseCursor = 1;
              else //pageup
                this.mouseCursor = 2;
            }
          }
          else if ( trow == 1 || trow == 2)
          {
            if(this.prefs.useMouseBrowsingEx)
            {
              if(tcol<2)//[
                this.mouseCursor = 8;
              else if ( tcol >cols-5 )//]
                this.mouseCursor = 9;
              else if ( tcol<7 ) //back
                this.mouseCursor = 1;
              else //pageup
                this.mouseCursor = 2;
            }
            else
            {
              if ( tcol<7 ) //back
                this.mouseCursor = 1;
              else //pageup
                this.mouseCursor = 2;
            }
          }
          else if ( tcol<7 ) //back
            this.mouseCursor = 1;
          else if ( trow < rows/2) //pageup
            this.mouseCursor = 2;
          else //pagedown
            this.mouseCursor = 3;
          break;
        case 1: //MENU
          if ( trow>0 && trow < rows-1 )
          {
            if (tcol>7) //menu item
              this.mouseCursor = 7;
            else //back
              this.mouseCursor = 1;
          }
          else
          {
            this.mouseCursor = 0;
            //SetCursor(m_ArrowCursor);m_CursorState=0;
          }
          break;
        default:
          this.mouseCursor = 0;
          break;
        }
      }
      this.BBSWin.style.cursor = mouseCursorMap[this.mouseCursor];
    },

    resetMousePos: function(){
      if(this.prefs.useMouseBrowsing)
        this.onMouse_move(this.tempMouseCol, this.tempMouseRow, true);
    },

    clearHighlight: function(){
          if(this.prefs.highlightCursor)
          {
            var rows=this.rows;
            var lines=this.lines;
            if(this.nowHighlight!=-1)
            {
              var line=lines[this.nowHighlight];
              for(var i=0; i<this.cols; ++i)
                line[i].needUpdate = true;
            }
          }
          this.nowHighlight = -1;
          if(this.prefs.highlightCursor)
          {
            this.updateCharAttr();
            this.view.update(false);
          }
          //document.getElementById('testdata4').innerHTML = "hightlight = -1";
          this.mouseCursor = 0;
    },

    initPttStr: function(){
      var tmp = '\xa1\x69\xba\xeb\xb5\xd8\xa4\xe5\xb3\xb9\xa1\x6a';
      this.PTTZSTR1=this.conv.convertStringToUTF8(tmp, this.prefs.charset, true, true);
      tmp = '\xa1\x69\xa5\x5c\xaf\xe0\xc1\xe4\xa1\x6a';
      this.PTTZSTR2=this.conv.convertStringToUTF8(tmp, this.prefs.charset, true, true);
      tmp = '\x5b\xa1\xf6\x5d\xc2\xf7\xb6\x7d\x20\x5b\xa1\xf7\x5d\xbe\x5c\xc5\xaa';
      this.PTTZSTR3=this.conv.convertStringToUTF8(tmp, this.prefs.charset, true, true);
      tmp = '\xa4\xe5\xb3\xb9\xbf\xef\xc5\xaa';
      this.PTTZSTR4=this.conv.convertStringToUTF8(tmp, this.prefs.charset, true, true);
      tmp = '\xc2\x73\xc4\xfd';
      this.PTTZSTR5=this.conv.convertStringToUTF8(tmp, this.prefs.charset, true, true);
      tmp = '\xa5\xbb\xac\xdd\xaa\x4f\xa5\xd8\xab\x65\xa4\xa3\xb4\xa3\xa8\xd1\xa4\xe5\xb3\xb9\xba\xf4\xa7\x7d';
      this.PTTZSTR0=this.conv.convertStringToUTF8(tmp, this.prefs.charset, true, true);
    }
    */
};
return TermBuf;

});