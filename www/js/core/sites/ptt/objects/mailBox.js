define([], function () {

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

return MailBoxPtt;

});