function PrefsHandler(bbsCore) {
  this.bbsCore = bbsCore;
  this.termType = 'VT100';
  this.bbsCol = 80;
  this.bbsRow = 24;
  this.charset = 'big5';
  this.EnterChar = UnEscapeStr('^M');
  this.disableLinefeed = false;
  this.aidAction = 0;
  this.deleteDuplicate = true;
  this.loginPrompt = ['','',''],
  this.loginStr = ['',
                   '',    //your username  //TODO: save by HTML5 storage
                   '',   //your password
                   ''];
  this.savePassword = false;

}

PrefsHandler.prototype={
  loadPrefs : function () {
    var prefsIntNames = ['bbsCol', 'bbsRow', 'aidAction'];
    var prefsBoolNames = ['deleteDuplicate', 'savePassword'];
    var prefsStrNames = ['termType', 'charset',
                         'username', 'password'];
    var value;
    for(var i=0;i<prefsIntNames.length;++i) {
      value = window.localStorage.getItem('openptt.' + prefsIntNames[i]);
      if(value == null) {
        window.localStorage.setItem('openptt.' + prefsIntNames[i], this[prefsIntNames[i]]);
      } else {
        this[prefsIntNames[i]] = parseInt(value);
      }
    }
    for(var i=0;i<prefsBoolNames.length;++i) {
      value = window.localStorage.getItem('openptt.' + prefsBoolNames[i]);
      if(value == null) {
        window.localStorage.setItem('openptt.' + prefsBoolNames[i], this[prefsBoolNames[i]]);
      } else {
        this[prefsBoolNames[i]] = value == 'true' ? true : false;
      }
    }
    for(var i=0;i<prefsStrNames.length;++i) {
      value = window.localStorage.getItem('openptt.' + prefsStrNames[i]);
      if(value == null) {
        window.localStorage.setItem('openptt.' + prefsStrNames[i], this[prefsStrNames[i]]);
      } else {
        this[prefsStrNames[i]] = value;
      }
    }
  },

  saveUsernameAndPassword: function (username, password) {
    window.localStorage.setItem('openptt.username', username);
    window.localStorage.setItem('openptt.password', password);
    window.localStorage.setItem('openptt.savePassword', 'true');
  },

  removeUsernameAndPassword: function () {
    //window.localStorage.removeItem();
    window.localStorage.setItem('openptt.username', '');
    window.localStorage.setItem('openptt.password', '');
    window.localStorage.setItem('openptt.savePassword', 'false');
  }

};