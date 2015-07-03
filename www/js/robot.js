function Robot(bbsCore) {
  this.bbsCore = bbsCore;
  this.prefs = bbsCore.prefs;
  //this.replyCount = [];
  this.autoLoginStage = 0;
  this.postLoginStage = 0;
  this.taskStage = 0;
  this.timerInterval = 40;
  //this.downloadArticle = new DownloadArticle(bbsCore);

  //termStatus: 0 //main list;
  //termStatus: 1 //favorite list;
  this.termStatus = 0;
  this.currentTask = 0; //1:getFavoriteList , 2:logout
  this.taskList = [];


  this.favoriteList = [];
  this.flMap = {};
}

Robot.prototype={

  // Modified from pcmanx-gtk2
  initialAutoLogin: function() {
    if(this.prefs.loginStr[1])
      this.autoLoginStage = this.prefs.loginStr[0] ? 1 : 2;
    else if(this.prefs.loginStr[2])
      this.autoLoginStage = 3;
    else
      this.autoLoginStage = 0;
  },

  // Modified from pcmanx-gtk2
  checkAutoLogin: function(row) {
    if(this.autoLoginStage > 3 || this.autoLoginStage < 1) {
      this.autoLoginStage = 0;
      return;
    }

    var line = this.bbsCore.buf.getRowText(row, 0, this.bbsCore.buf.cols);
    if(line.indexOf(this.prefs.loginPrompt[this.autoLoginStage - 1]) < 0)
      return;

    var Encoding = this.prefs.charset;
    var EnterKey = this.prefs.EnterChar;
    //this.send(this.convSend(this.prefs.loginStr[this.autoLoginStage-1] + this.prefs.EnterChar, Encoding, true));
    this.bbsCore.conn.convSend(this.prefs.loginStr[this.autoLoginStage - 1] + EnterKey, Encoding);

    if(this.autoLoginStage == 3) {
      //if(this.prefs.loginStr[3])
      //  this.bbsCore.conn.convSend(this.prefs.loginStr[3], Encoding);
      this.autoLoginStage = 0;
      this.postLoginStage = 1;
      //check deleteDuplicate
      setTimeout(this.checkLoginStatus.bind(this), this.timerInterval);
      return;
    }
    ++this.autoLoginStage;
  },


  checkLoginStatus: function() {

    var Encoding = this.prefs.charset;
    var EnterKey = this.prefs.EnterChar;
    var line1 = this.bbsCore.buf.getRowText(22, 0, this.bbsCore.buf.cols);
    var line2 = this.bbsCore.buf.getRowText(23, 0, this.bbsCore.buf.cols);
    var line3 = this.bbsCore.buf.getRowText(0, 0, this.bbsCore.buf.cols);

    //TODO: Remove these chinese, replace by escape encoding.
    if(this.postLoginStage == 1  && line1.indexOf('您想刪除其他重複登入的連線嗎') >= 0) {
      this.postLoginStage = 2;
      if(this.prefs.deleteDuplicate) {
        this.bbsCore.conn.convSend('y' + EnterKey, Encoding);
      } else {
        this.bbsCore.conn.convSend('n' + EnterKey, Encoding);
      }
    } else if((this.postLoginStage == 1 || this.postLoginStage == 2) && line2.indexOf('請按任意鍵繼續') >= 0) {
      this.postLoginStage = 3;
      this.bbsCore.conn.send(' ');
    } else if(this.postLoginStage == 3 && line2.indexOf('您要刪除以上錯誤嘗試的記錄嗎') >= 0) {
      this.postLoginStage = 4;
      this.bbsCore.conn.convSend('y' + EnterKey, Encoding);
    } else if((this.postLoginStage == 3 || this.postLoginStage == 4) && line3.indexOf('【主功能表】') >= 0) {
      console.log('main menu');
      this.termStatus = 0;
      this.postLoginStage = 0;
      var task = this.taskList.shift();
      task.callback(this.favoriteList);
      this.runNextTask();
      return;
    }
    setTimeout(this.checkLoginStatus.bind(this), this.timerInterval);
  },

  checkTask: function() {
    if(this.taskStage == 0)
      return;
    this.taskList[0].run();
  },

  addTask: function(task, force) {
    if(!force) {
      var count = this.taskList.length;
      for(var i=0;i<count;++i) {
        if(this.taskList[i].name == task.name) {
          return;
        }
      }
    }
    this.taskList.push(task);
    if(this.currentTask == 0)
      this.runNextTask();
  },

  runNextTask: function() {
    if(this.taskList.length > 0)
      this.taskList[0].run();
  },
  
  removeAllTask: function() {
    this.taskList = [];
  },

  getFavoriteListFromMap: function() {
    for(var i=1;i<65535;++i) {
      if(this.flMap['b' + i]) {
        this.favoriteList.push(this.flMap['b' + i]);
      } else {
        break;
      }
    }
    return this.favoriteList;
  },
  
  getFavoriteList: function() {
    //TODO: detect if favorite list empty
    this.currentTask = 1;

    if(this.taskStage == 0) {
      this.favoriteList = [];
      this.flMap = {};
      this.taskStage = 1;
      if(this.termStatus != 0) {
        this.bbsCore.conn.send('\x1b[D\x1b[D\x1b[D');
      }
      this.bbsCore.conn.send('f' + this.prefs.EnterChar + '\x1b[4~'); //f + enter + end -> show last item.
    } else if(this.taskStage == 1) {
      var line = this.bbsCore.buf.getRowText(0, 0, this.bbsCore.buf.cols);
      var firstBoardP1 = this.bbsCore.buf.getRowText(3, 0, 63);
      var firstBoardP2 = this.bbsCore.buf.getRowText(3, 64, 67);
      var firstBoardData = parseBoardData(firstBoardP1, firstBoardP2);
      if(line.indexOf('【看板列表】') >= 0 && firstBoardData) {
        this.termStatus = 1;
        //console.log('this.bbsCore.buf.cur_x = ' + this.bbsCore.buf.cur_x);
        console.log(firstBoardData.sn);
        for(var i=3;i<23;++i) {
          var boardP1 = this.bbsCore.buf.getRowText(i, 0, 63);
          var boardP2 = this.bbsCore.buf.getRowText(i, 64, 67);
          var boardData = parseBoardData(boardP1, boardP2);
          if(boardData) {
            this.flMap['b'+boardData.sn] = boardData;
          }
        }
        if(this.flMap['b1']) {
          this.getFavoriteListFromMap();
          this.taskStage = 0;
          var task = this.taskList.shift();
          task.callback(this.favoriteList);
          this.currentTask = 0;
          this.runNextTask();
          return;          
        }
        this.taskStage = 2;
        this.bbsCore.conn.send('\x1b[5~'); //page up.
      }
    }
    else if(this.taskStage == 2) {
      var firstBoardP1 = this.bbsCore.buf.getRowText(3, 0, 63);
      var firstBoardP2 = this.bbsCore.buf.getRowText(3, 64, 67);
      var firstBoardData = parseBoardData(firstBoardP1, firstBoardP2);
      if(firstBoardData) {
        console.log(firstBoardData.sn);
        for(var i=3;i<23;++i) {
          var boardP1 = this.bbsCore.buf.getRowText(i, 0, 63);
          var boardP2 = this.bbsCore.buf.getRowText(i, 64, 67);
          var boardData = parseBoardData(boardP1, boardP2);
          if(boardData && !this.flMap['b'+boardData.sn]) {
              this.flMap['b'+boardData.sn] = boardData;
          }
        }
        if(this.flMap['b1']) {
          this.getFavoriteListFromMap();
          this.taskStage = 0;
          var task = this.taskList.shift();
          task.callback(this.favoriteList);
          this.currentTask = 0;
          this.runNextTask();
          return;          
        }
        this.bbsCore.conn.send('\x1b[5~'); //page up.
      }      
    }
    setTimeout(this.getFavoriteList.bind(this), this.timerInterval);
  },

  getBoardList: function() {

  },
  
  login:function() {
  },

  logout: function() {
    //TODO: detect if favorite list empty
    this.currentTask = 2;

    if(this.taskStage == 0) {
      this.taskStage = 1;
      if(this.termStatus != 0) {
        this.bbsCore.conn.send('\x1b[D\x1b[D\x1b[D');
      }
    } else if(this.taskStage == 1) {
      var line = this.bbsCore.buf.getRowText(0, 0, this.bbsCore.buf.cols);
      if(line.indexOf('【主功能表】') >= 0) {
        this.termStatus = 0;
        this.taskStage = 2;
        this.bbsCore.conn.send('g' + this.prefs.EnterChar); //g + enter
      }
    } else if(this.taskStage == 2) {
      var line = this.bbsCore.buf.getRowText(22, 0, this.bbsCore.buf.cols);
      if(line.indexOf('您確定要離開【 批踢踢實業坊 】嗎') >= 0) {
        this.bbsCore.conn.send('y' + this.prefs.EnterChar + ' '); //y + enter + space

        this.taskStage = 0;
        var task = this.taskList.shift();
        task.callback(this.favoriteList);
        this.currentTask = 0;
        this.removeAllTask();
        return;
      }
    }
    setTimeout(this.logout.bind(this), this.timerInterval);
  }
};