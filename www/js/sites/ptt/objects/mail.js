define([], function () {

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

return MailPtt;

});