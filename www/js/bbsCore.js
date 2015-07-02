function BBSCore() {
  this.prefs = {
    termType: 'VT100',
    bbsCol: 80,
    bbsRow: 24,
    charset: 'big5',
    EnterChar: UnEscapeStr('^M'),
    disableLinefeed: false,
    aidAction: 0,
    deleteDuplicate: true,
    loginPrompt: ['','',''],
    loginStr: ['',
               '',    //your username  //TODO: save by HTML5 storage
               '',   //your password
               ''],
    store:false
  };
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
  }
};