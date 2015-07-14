function BBSCore() {
  this.strUtil = new StrUtil();
  this.prefs = new PrefsHandler(this);
  this.prefs.loadPrefs();
  this.conn = null;
  this.buf = new TermBuf(this, 80, 24);
  this.view = new TermView(this, this.buf);
  this.parser = new AnsiParser(this.buf);
  this.robot = null;
  this.favoriteListEventNotify = [];
  this.boardListEventNotify = [];
  this.connectionStatusEventNotify = [];
  this.articleListEventNotify = [];
  this.articleContentEventNotify = [];
}

BBSCore.prototype={

  connect: function(site, port) {
    this.conn.connect(site, port);
  },

  close: function() {

  },

  onConnect: function(conn) {

  },

  onData: function(conn, data) {
    this.parser.feed(data);
  },

  onClose: function(conn) {
    //alert('onClose');
  },

  resetUnusedTime: function() {

  },

  addTask: function(taskName, callback, extData) {
    if(taskName in this.robot)
    this.robot.addTask(
      {
        name: taskName,
        run: this.robot[taskName].bind(this.robot),
        callback: callback,
        extData: extData
      }
    );
  },
  
  login: function(site, username, password, savePassword) {
    var siteData = window.siteManager.getSite(site);
    this.prefs.setRoot( siteData.prefsRoot );    
    //this.buf.setCol(siteData.col);
    //this.buf.setCol(siteData.row);

    if(this.conn && siteData.protocol != this.conn.protocolName) {
      //this.conn.release();
      this.conn = null;
    }
    if(!this.conn) {
      if(siteData.protocol == 'telnet') {
        this.conn = new TelnetProtocol(this);
      } else if(siteData.protocol == 'ssh') {
        this.conn = new SshProtocol(this);
      }
    }
    
    if(this.robot && siteData.name != site) {
      this.robot = null;
    }
    if(!this.robot)
      this.robot = new siteData.Robot(this);   

    if(savePassword) {
      this.prefs.saveUsernameAndPassword(username, password);
    } else {
      this.prefs.removeUsernameAndPassword();
    }
    this.prefs.loginStr[1] = username;
    this.prefs.loginStr[2] = password;
    this.addTask('login', this.onLoginEvent.bind(this));
    this.addTask('getFavoriteList', this.onFavoriteListEvent.bind(this));
    this.connect(siteData.addr, siteData.port);
  },
  
  logout: function() {
    this.addTask('logout', this.onLogoutEvent.bind(this));
  },
  
  enterBoard: function(board) {
    this.addTask('gotoMainFunctionList', this.onNullEvent.bind(this), board);
    this.addTask('enterBoard', this.onNullEvent.bind(this), board);
  },

  enterDirectory: function(board) {
    this.addTask('gotoMainFunctionList', this.onNullEvent.bind(this), board);
    this.addTask('enterDirectory', this.onNullEvent.bind(this), board);
  },

  getBoardList: function(directory) {
    this.addTask('getBoardList', this.onBoardListEvent.bind(this), directory);
  },

  getArticleList: function(extData) {
    this.addTask('getArticleList', this.onArticleListEvent.bind(this), extData);
  },
  
  getArticleContent: function(extData) {
    this.addTask('getArticleContent', this.onArticleContentEvent.bind(this), extData);
  },
  
  onNullEvent: function(){
  },

  onLoginEvent: function(status, message){
    for(var i=0;i<this.connectionStatusEventNotify.length;++i){
      this.connectionStatusEventNotify[i](status, message);
    }
  },

  onBoardListEvent: function(data){
    for(var i=0;i<this.boardListEventNotify.length;++i){
      this.boardListEventNotify[i](data);
    }
  },

  onFavoriteListEvent: function(data){
    for(var i=0;i<this.favoriteListEventNotify.length;++i){
      this.favoriteListEventNotify[i](data);
    }
  },

  onLogoutEvent: function(data){
    for(var i=0;i<this.connectionStatusEventNotify.length;++i){
      this.connectionStatusEventNotify[i]('logout');
    }
  },

  onArticleListEvent: function(data, data2){
    for(var i=0;i<this.articleListEventNotify.length;++i){
      this.articleListEventNotify[i](data, data2);
    }
  },

  onArticleContentEvent: function(data){
    for(var i=0;i<this.articleContentEventNotify.length;++i){
      this.articleContentEventNotify[i](data);
    }
  },

  regFavoriteListEvent: function(eventCallback) {
    this.favoriteListEventNotify.push(eventCallback);
  },

  regBoardListEvent: function(eventCallback) {
    this.boardListEventNotify.push(eventCallback);
  },

  regConnectionStatusEvent: function(eventCallback) {
    this.connectionStatusEventNotify.push(eventCallback);
  },
  
  regArticleListEvent: function(eventCallback) {
    this.articleListEventNotify.push(eventCallback);
  },
  
  regArticleContentEvent: function(eventCallback) {
    this.articleContentEventNotify.push(eventCallback);
  }

};
