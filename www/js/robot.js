function Robot(listener) {
    this.listener = listener;
    this.prefs = listener.prefs;
    //this.replyCount = [];
    this.autoLoginStage=0;
    //this.downloadArticle = new DownloadArticle(listener);
}

Robot.prototype={

    // Modified from pcmanx-gtk2
    initialAutoLogin: function() {
        if(this.prefs.loginStr[1])
            this.autoLoginStage = this.prefs.loginStr[0] ? 1 : 2;
        else if(this.prefs.loginStr[2]) this.autoLoginStage = 3;
        else this.autoLoginStage = 0;
    },

    // Modified from pcmanx-gtk2
    checkAutoLogin: function(row) {
        if(this.autoLoginStage > 3 || this.autoLoginStage < 1) {
          this.autoLoginStage = 0;
          return;
        }

        var line = this.listener.buf.getRowText(row, 0, this.listener.buf.cols);
        if(line.indexOf(this.prefs.loginPrompt[this.autoLoginStage - 1]) < 0)
          return;

        var Encoding = this.prefs.charset;
        var EnterKey = this.prefs.EnterChar;
        console.log('this.autoLoginStage = ' + this.autoLoginStage);
        //this.send(this.convSend(this.prefs.loginStr[this.autoLoginStage-1] + this.prefs.EnterChar, Encoding, true));
        this.listener.conn.convSend(this.prefs.loginStr[this.autoLoginStage - 1] + EnterKey, Encoding);

        if(this.autoLoginStage == 3) {
          //if(this.prefs.loginStr[3])
          //  this.listener.conn.convSend(this.prefs.loginStr[3], Encoding);
          this.autoLoginStage = 4;
          //check deleteDuplicate
          return;
        }
        ++this.autoLoginStage;
    },
    
    checkLoginStatus: function(row) {
      var Encoding = this.prefs.charset;
      var EnterKey = this.prefs.EnterChar;
      var line1 = this.listener.buf.getRowText(22, 0, this.listener.buf.cols);
      var line2 = this.listener.buf.getRowText(23, 0, this.listener.buf.cols);
      var line3 = this.listener.buf.getRowText(0, 0, this.listener.buf.cols);
      //TODO: Remove these chinese, replace by escape encoding.
      if(line1.indexOf('您想刪除其他重複登入的連線嗎') >= 0) {
        this.listener.conn.convSend('y' + EnterKey, Encoding);
      } else if(line2.indexOf('請按任意鍵繼續') >= 0) {
        this.listener.conn.send(' ', Encoding);
        //this.autoLoginStage = 0;
      } else if(line2.indexOf('您要刪除以上錯誤嘗試的記錄嗎') >= 0) {
        this.listener.conn.convSend('y' + EnterKey, Encoding);
        //this.autoLoginStage = 0;
      } else if(line3.indexOf('【主功能表】') >= 0) {
        this.listener.conn.send('f' + EnterKey, Encoding);
        this.autoLoginStage = 0;
      }
    }
};