function BoardPtt(bbsCore, sn, boardName, bClass, description, isDirectory, isHidden, popular) {
  this.bbsCore = bbsCore;
  this.robot = bbsCore.robot;
  this.sn = sn;
  this.boardName = boardName;
  this.bClass = bClass;
  this.description = description;
  this.isDirectory = isDirectory;
  this.isHidden = isHidden;
  this.popular = popular;
  this.path = [];
  this.subBoardList = [];
  this.articleList = [];
  this.highlightList = [];
  this.articleListMap = {};
  
  this.subBoardListReady = false;
}

BoardPtt.prototype={
  enter: function (taskArray) {
    if(this.isHidden)
      return false;

    if(this.isDirectory && this.subBoardListReady) {
      this.bbsCore.apply('updateBoardList', this);
      return true;
    }

    this.robot.addTask({
      name: 'gotoMainFunctionList',
      run: this.robot.gotoMainFunctionList.bind(this.robot),
      callback: function(){},
      extData: this
    });
    if(this.isDirectory) {
      if(!taskArray)
        taskArray = ['enterDirectory', 'getBoardList'];
      if(taskArray.indexOf('enterDirectory') != -1) {
        this.robot.addTask({
          name: 'enterDirectory',
          run: this.robot.enterDirectory.bind(this.robot),
          callback: function(){},
          extData: this
        });
      }
      if(taskArray.indexOf('getBoardList') != -1) {
        this.robot.addTask({
          name: 'getBoardList',
          run: this.robot.getBoardList.bind(this.robot),
          callback: function(subBoardList){
                      this.subBoardList = subBoardList;
                      this.subBoardListReady = true;
                      this.bbsCore.apply('updateBoardList', this);
                    }.bind(this),
          extData: this
        });
      }
    } else {
      if(!taskArray)
        taskArray = ['enterBoard', 'getArticleList'];
      if(taskArray.indexOf('enterBoard') != -1) {
        this.robot.addTask({
          name: 'enterBoard',
          run: this.robot.enterBoard.bind(this.robot),
          callback: function(){},
          extData: this
        });
      }
      if(taskArray.indexOf('getArticleList') != -1) {
        this.robot.addTask({
          name: 'getArticleList',
          run: this.robot.getArticleList.bind(this.robot),
          callback: this._updateArticleList.bind(this),
          extData: {direction: 'none'}
        });
      }
    }
    return true;
  },
  
  refresh: function () {
    if(this.isHidden)
      return false;
    this.robot.addTask({
      name: 'gotoMainFunctionList',
      run: this.robot.gotoMainFunctionList.bind(this.robot),
      callback: function(){},
      extData: this
    });
    this.robot.addTask({
      name: 'enterBoard',
      run: this.robot.enterBoard.bind(this.robot),
      callback: function(){},
      extData: this
    });
    this.robot.addTask({
      name: 'getArticleList',
      run: this.robot.getArticleList.bind(this.robot),
      callback: this._updateArticleList.bind(this),
      extData: {boardName: this.boardName,
                direction: 'new',
                max: this.articleList[0].sn,
                min: this.articleList[this.articleList.length-1].sn}
    });
    return true;
  },
  
  getOldData: function (count) {
    if(this.isHidden)
      return false;
    this.robot.addTask({
      name: 'gotoMainFunctionList',
      run: this.robot.gotoMainFunctionList.bind(this.robot),
      callback: function(){},
      extData: this
    });
    this.robot.addTask({
      name: 'enterBoard',
      run: this.robot.enterBoard.bind(this.robot),
      callback: function(){},
      extData: this
    });
    this.robot.addTask({
      name: 'getArticleList',
      run: this.robot.getArticleList.bind(this.robot),
      callback: this._updateArticleList.bind(this),
      extData: {boardName: this.boardName,
                direction: 'old',
                max: this.articleList[0].sn,
                min: this.articleList[this.articleList.length-1].sn,
                count: count} //count: how many articles you needed.
    });
    return true;
  },
  
  _updateArticleList: function (data, updateInfo) {
    if(updateInfo && updateInfo.aClassList) {
      this.articleClassList = updateInfo.aClassList;
    }
    
    if(updateInfo && updateInfo.highlightList && updateInfo.highlightList.length) {
      this.highlightList = updateInfo.highlightList;
      this.bbsCore.apply('updateArticleList', this);
    }

    //TODO: we need remove some article for saving memory.
    if(updateInfo && updateInfo.updateList && updateInfo.updateList.length) {
      //console.log(updateInfo.updateList.length);
      //update article - start
      var updateList = updateInfo.updateList;
      var updateFields = updateInfo.updateFields;
      for(var i=0;i<updateList.length;++i) {
        var index = this.articleListMap[updateList[i].sn];
        if(index < this.articleList.length && this.articleList [index].sn == updateList[i].sn) {
          if(updateFields) {
            for(var j=0;j<updateFields.length;++j) {
              this.articleList[index][updateFields[j]] = updateList[i][updateFields[j]];
            }
          } else {
            this.articleList[index] = updateList[i];
          }
        }
      }
      //update article - start
    }

    if(data && data.length > 0) {
      if(!this.articleList || (this.articleList && this.articleList.length == 0)) {
        this.articleList = data;
      } else {
        if(data[0].sn < this.articleList[this.articleList.length-1].sn) {
          this.articleList = this.articleList.concat(data);
        } else {
          this.articleList = data.concat(this.articleList);
        }
      }

      //keep a maping table - start
      this.articleListMap = {};
      for(var i=0;i<this.articleList.length;++i)
        this.articleListMap[ this.articleList[i].sn ] = i;
      //keep a maping table - end
    }
    this.bbsCore.apply('updateArticleList', this);
  }
};

function ArticlePtt(bbsCore, sn, date, author, popular, aClass, title, level) {
  this.bbsCore = bbsCore;
  this.robot = bbsCore.robot;
  this.sn = sn;
  this.date = date;
  this.author = author;
  this.popular = popular;
  this.aClass = aClass;
  this.title = title;
  this.level = level;
  //aid
  //url
  this.content = {};
}

ArticlePtt.prototype={
  //robot crawl all article content.
  //for very long article content that took long time.
  //we need crawl maybe one or two page and waiting user scroll(then crawl more).

  //TODO: need finish this function
  //about page:
  //0 -> get all page/update/from current to newest
  //n -> get n page
  //$scope.bbsCore.getArticleContent({boardName: $scope.currentBoardName,
  //                                  article: article,
  //                                  page: 0 });
    
  //$scope.bbsCore.getArticleContent({boardName: $scope.currentBoardName,
  //                                  article: article,
  //                                  articleData: currentArticle,
  //                                  page: 2 });

  read: function () {
    if(this.author == '-')
      return false;

    this.robot.addTask({
      name: 'getArticleContent',
      run: this.robot.getArticleContent.bind(this.robot),
      callback: function(data){
                  this.content = data;
                  //this.lines = data.lines;
                  this.bbsCore.apply('updateArticleContent', this);
                }.bind(this),
      extData: this}
    );
    return true;
  }
};

function NewArticlePtt(bbsCore, board) {
  this.bbsCore = bbsCore;
  this.robot = bbsCore.robot;
  this.board = board;
  this.title = '';
  this.content = '';
}

NewArticlePtt.prototype={
  post: function () {
    this.board.enter(['enterBoard']);
    this.robot.addTask({
      name: 'postArticle',
      run: this.robot.postArticle.bind(this.robot),
      callback: function(){
                  //this.bbsCore.apply('updateBoardList', this);
                }.bind(this),
      extData: this
    });
    this.board.refresh();
    return true;
  }
};

function ClassPtt(bbsCore) {
  this.bbsCore = bbsCore;
  this.robot = bbsCore.robot;
  this.sn = 'c';
  this.boardName = '1ClassRoot';
  this.subBoardList = [];
  this.subBoardListReady = true;
  this.isDirectory = true;
  this.isHidden = false;

  var classBoardInfo = [
    {bClass: '市民廣場',   description: '報告站長 PTT咬我'},
    {bClass: '臺灣大學',   description: '臺大, 臺大, 臺大'},
    {bClass: '政治大學',   description: '政大, 政大, 政大'},
    {bClass: '青蘋果樹',   description: '校園, 班板, 社團'},
    {bClass: '活動中心',   description: '社團, 聚會, 團體'},
    {bClass: '視聽劇場',   description: '偶像, 音樂, 廣電'},
    {bClass: '戰略高手',   description: '遊戲, 數位, 程設'},
    {bClass: '卡漫夢工廠', description: '卡通, 漫畫, 動畫'},
    {bClass: '生活娛樂館', description: '生活, 娛樂, 心情'},
    {bClass: '國家研究院', description: '政治, 文學, 學術'},
    {bClass: '國家體育場', description: '汗水, 鬥志, 膽識'},
  ];
  for(var i=0;i<classBoardInfo.length;++i) {
    var board = new BoardPtt(this.bbsCore,
                          i+1, //sn
                          '1ClassBranch', //boardName
                          classBoardInfo[i].bClass, //bClass
                          classBoardInfo[i].description, //description
                          true, //isDirectory
                          false, //isHidden
                          '' //popular
                          );
    board.path = ['c'];
    this.subBoardList.push(board);
  }
}

ClassPtt.prototype={

};

function MailPtt(bbsCore, sn, date, mailer, title) {
  this.bbsCore = bbsCore;
  this.robot = bbsCore.robot;
  this.sn = sn;
  this.date = date;
  this.mailer = mailer;
  this.title = title;
  this.aid = 'mail';
  this.content = {};
}

MailPtt.prototype={
  read: function () {
    this.robot.addTask({
      name: 'getArticleContent',
      run: this.robot.getArticleContent.bind(this.robot),
      callback: function(data){
                  this.content = data;
                  //this.lines = data.lines;
                  this.bbsCore.apply('updateArticleContent', this);
                }.bind(this),
      extData: this}
    );
    return true;
  }
}

function MailBoxPtt(bbsCore) {
  this.bbsCore = bbsCore;
  this.robot = bbsCore.robot;
  this.total = 0;
  this.max = 0;
  this.mailList = [];
}

MailBoxPtt.prototype={
  enter: function () {
    this.robot.addTask({
      name: 'gotoMainFunctionList',
      run: this.robot.gotoMainFunctionList.bind(this.robot),
      callback: function(){},
      extData: this
    });
    this.robot.addTask({
      name: 'enterMailBox',
      run: this.robot.enterMailBox.bind(this.robot),
      callback: function(){},
      extData: this
    });
    this.robot.addTask({
      name: 'getMailList',
      run: this.robot.getMailList.bind(this.robot),
      callback: function(mailList){
                  this.mailList = mailList;
                  this.bbsCore.apply('updateMailList', this);
                }.bind(this),
      extData: this
    });
    return true;
  }
}