function BBSCore() {
  this.prefs = new PrefsHandler(this);
  this.prefs.loadPrefs();
  this.conn = new TelnetProtocol(this);
  //this.view = new TermView(80, 24);
  this.buf = new TermBuf(this, 80, 24);
  this.parser = new AnsiParser(this.buf);
  this.robot = new Robot(this);
  this.favoriteListEventNotify = [];
  this.connectionStatusEventNotify = [];
  this.articleListEventNotify = [];
}

BBSCore.prototype={

  connect: function(extData, hostkeys) {
    this.conn.connect('ptt.cc', 23);
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
  
  login: function(username, password, savePassword) {
    if(savePassword) {
      this.prefs.saveUsernameAndPassword(username, password);
    } else {
      this.prefs.removeUsernameAndPassword();
    }
    this.prefs.loginStr[1] = username;
    this.prefs.loginStr[2] = password;
    this.addTask('login', this.onLoginEvent.bind(this));
    this.addTask('getFavoriteList', this.onFavoriteListEvent.bind(this));
    this.connect();
  },
  
  logout: function() {
    this.addTask('logout', this.onLogoutEvent.bind(this));
  },
  
  enterBoard: function(board) {
    this.addTask('enterBoard', this.onNullEvent.bind(this), board);
  },
  
  getArticleList: function(board) {
    this.addTask('getArticleList', this.onArticleListEvent.bind(this), board);
  },
  
  onNullEvent: function(){
  },

  onLoginEvent: function(data){
    //TODO: handle login error here
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

  onArticleListEvent: function(data){
    for(var i=0;i<this.articleListEventNotify.length;++i){
      this.articleListEventNotify[i](data);
    }
  },

  regFavoriteListEvent: function(eventCallback) {
    this.favoriteListEventNotify.push(eventCallback);
  },

  regConnectionStatusEvent: function(eventCallback) {
    this.connectionStatusEventNotify.push(eventCallback);
  },
  
  regArticleListEvent: function(eventCallback) {
    this.articleListEventNotify.push(eventCallback);
  }

};