define([], function () {

function PrefsHandler(bbsCore) {
  this.bbsCore = bbsCore;
  this.termType = 'VT100';
  this.bbsCol = 80;
  this.bbsRow = 24;
  this.charset = 'big5';
  this.disableLinefeed = false;
  this.aidAction = 0;
  this.deleteDuplicate = true;
  this.loginPrompt = ['','',''],
  this.loginStr = ['',
                   '',    //your username  //TODO: save by HTML5 storage
                   '',   //your password
                   ''];
  this.savePassword = false;
  this.prefsRoot = 'openptt.';
}

PrefsHandler.prototype={
  setRoot: function (prefsRoot) {
    var oldRoot = this.prefsRoot;
    this.prefsRoot = prefsRoot;
    if(oldRoot != this.prefsRoot) {
      this.loadPrefs();
    }
  },
  loadPrefs : function () {
    var prefsIntNames = ['aidAction']; //['bbsCol', 'bbsRow', 'aidAction'];
    var prefsBoolNames = ['deleteDuplicate', 'savePassword'];
    var prefsStrNames = ['username', 'password'];
    var value;
    for(var i=0;i<prefsIntNames.length;++i) {
      value = window.localStorage.getItem(this.prefsRoot + prefsIntNames[i]);
      if(value == null) {
        window.localStorage.setItem(this.prefsRoot + prefsIntNames[i], this[prefsIntNames[i]]);
      } else {
        this[prefsIntNames[i]] = parseInt(value);
      }
    }
    for(var i=0;i<prefsBoolNames.length;++i) {
      value = window.localStorage.getItem(this.prefsRoot + prefsBoolNames[i]);
      if(value == null) {
        window.localStorage.setItem(this.prefsRoot + prefsBoolNames[i], this[prefsBoolNames[i]]);
      } else {
        this[prefsBoolNames[i]] = value == 'true' ? true : false;
      }
    }
    for(var i=0;i<prefsStrNames.length;++i) {
      value = window.localStorage.getItem(this.prefsRoot + prefsStrNames[i]);
      if(value == null) {
        window.localStorage.setItem(this.prefsRoot + prefsStrNames[i], this[prefsStrNames[i]]);
      } else {
        this[prefsStrNames[i]] = value;
      }
    }
  },

  saveUsernameAndPassword: function (username, password) {
    window.localStorage.setItem(this.prefsRoot + 'username', username);
    window.localStorage.setItem(this.prefsRoot + 'password', password);
    window.localStorage.setItem(this.prefsRoot + 'savePassword', 'true');
  },

  removeUsernameAndPassword: function () {
    //window.localStorage.removeItem();
    window.localStorage.setItem(this.prefsRoot + 'username', '');
    window.localStorage.setItem(this.prefsRoot + 'password', '');
    window.localStorage.setItem(this.prefsRoot + 'savePassword', 'false');
  },

  savePrefsValue : function (key, value) {
    console.log('savePrefsValue, key = ' + key + ', value = ' + value);
    window.localStorage.setItem(this.prefsRoot + key, value);
  },

  loadPrefsValue : function (key) {
    var value = window.localStorage.getItem(this.prefsRoot + key);
    console.log('loadPrefsValue, key = ' + key + ', value = ' + value);
    return value;
  }
};

return PrefsHandler;

});
