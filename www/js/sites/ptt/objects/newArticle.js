define([], function () {

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

return NewArticlePtt;

});
