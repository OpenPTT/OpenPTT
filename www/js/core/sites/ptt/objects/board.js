define([], function () {

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

return BoardPtt;

});
