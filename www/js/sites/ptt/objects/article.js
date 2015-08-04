define([], function () {

function ArticlePtt(bbsCore, sn, date, author, popular, aClass, title, level) {
  this.bbsCore = bbsCore;
  this.robot = bbsCore.robot;
  this.sn = sn;
  this.date = date;
  this.author = author;
  this.popular = popular;
  this.aClass = aClass;
  this.title = title;
  this.level = level;
  //aid
  //url
  this.content = {};
}

ArticlePtt.prototype={
  //robot crawl all article content.
  //for very long article content that took long time.
  //we need crawl maybe one or two page and waiting user scroll(then crawl more).

  //TODO: need finish this function
  //about page:
  //0 -> get all page/update/from current to newest
  //n -> get n page
  //$scope.bbsCore.getArticleContent({boardName: $scope.currentBoardName,
  //                                  article: article,
  //                                  page: 0 });

  //$scope.bbsCore.getArticleContent({boardName: $scope.currentBoardName,
  //                                  article: article,
  //                                  articleData: currentArticle,
  //                                  page: 2 });

  read: function () {
    if(this.author == '-')
      return false;

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
};

return ArticlePtt;

});

