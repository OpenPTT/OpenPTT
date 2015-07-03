function BBSCore() {
  this.prefs = new PrefsHandler(this);
  this.prefs.loadPrefs();
  this.conn = new TelnetProtocol(this);
  //this.view = new TermView(80, 24);
  this.buf = new TermBuf(this, 80, 24);
  this.parser = new AnsiParser(this.buf);
  this.robot = new Robot(this);
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

  },

  resetUnusedTime: function() {

  },

  addTask: function(taskName, callback) {
    if(taskName in this.robot)
    this.robot.addTask(
      {
        name: taskName,
        run: this.robot[taskName].bind(this.robot),
        callback: callback
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
  
  onLoginEvent: function(){
    //TODO: handle login error here
  },
  onFavoriteListEvent: function(data){
    //TODO: update FavoriteList
  }
};