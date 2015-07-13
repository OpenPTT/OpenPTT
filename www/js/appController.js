angular.module('app', ['onsen', 'ngSanitize']);

angular.module('app').controller('LoginController', function ($scope, $window) {
  $scope.init = function() {
    if(!$window.app.bbsCore)
      $window.app.bbsCore = new BBSCore();
    $scope.bbsCore = $window.app.bbsCore;
    $scope.errorMessage = '';
    $scope.sitename = 'PTT';
    $scope.filterResult = [];
    
    $scope.username = $scope.bbsCore.prefs.username;
    $scope.password = $scope.bbsCore.prefs.password;
    $scope.savePassword = $scope.bbsCore.prefs.savePassword;

    $scope.bbsCore.regConnectionStatusEvent($scope.updateMainUI);
  };

  $scope.login = function () {
    console.log('login');
    $scope.bbsCore.login($scope.sitename, $scope.username, $scope.password, $scope.savePassword);
  };

  $scope.updateMainUI = function (status, message) {
    switch (status){
      case "logout":
        mainNavigator.popPage('mainUI.html');
        $scope.errorMessage = '';
        break;
      case "login-success":
        mainNavigator.pushPage('mainUI.html');
        loginModal.hide();
        $scope.errorMessage = '';
        break;
      case "login-failed":
        //show error message
        loginModal.hide();
        $scope.errorMessage = message;
        $scope.$apply();
      case "disconnect":
        break;
      default:
        break;
    }
  };
  
});

angular.module('app').controller('AppController', ['$scope', '$window', '$q', '$sce', function ($scope, $window, $q, $sce) {
  $scope.bbsCore = null;
  $scope.nickname = '';
  $scope.currentBoardName = '';
  $scope.favoriteList = [];
  $scope.highlightList = [];
  $scope.articleListMap = {};
  $scope.currentArticle = {};
  $scope.lines = [];
 
  $scope.init = function() {
    if(!$window.app.bbsCore)
      $window.app.bbsCore = new BBSCore();
    $scope.bbsCore = $window.app.bbsCore;
    
    $scope.bbsCore.regFavoriteListEvent($scope.updateFavoriteList);
    $scope.bbsCore.regArticleListEvent($scope.updateArticleList);
    $scope.bbsCore.regConnectionStatusEvent($scope.updateMainUI);
    $scope.bbsCore.regArticleContentEvent($scope.updateArticleContent);
  };

  $scope.doSomething = function () {
    ons.notification.alert({ message: 'tapped' });
  };

  $scope.enterBoard = function (board) {
    $scope.highlightList = [];
    $scope.articleList = [];
    $scope.$apply();
    $scope.currentBoardName = board.boardName;
    //alert(board.sn);
    $scope.bbsCore.enterBoard(board);
    $scope.bbsCore.getArticleList({direction: 'none'});
  };

  $scope.login = function () {
    console.log('$scope.username = ' + $scope.username);
    console.log('$scope.password = ' + $scope.password);
    console.log('$scope.savePassword = ' + $scope.savePassword);
    //$scope.bbsCore.login($scope.username, $scope.password, $scope.savePassword);
  };

  $scope.logout = function () {
    $scope.bbsCore.logout();
  };

  $scope.updateArticleContent = function (data) {
    //$scope.articleContent = data.lines.join('');
    $scope.currentArticle = data;
    $scope.lines = [];
    for(var i=0;i<data.lines.length;++i) {
      $scope.lines.push({sn: i, html: $sce.trustAsHtml(data.lines[i])});
    }
    $scope.$apply();
  };
  
  $scope.updateArticleList = function (data, updateInfo) {
    //highlightList
    if(updateInfo && updateInfo.highlightList && updateInfo.highlightList.length) {
      $scope.highlightList = updateInfo.highlightList;
      $scope.$apply();
    }

    //TODO: we need remove some article for saving memory.
    if(updateInfo && updateInfo.updateList && updateInfo.updateList.length) {
      console.log(updateInfo.updateList.length);
      //update article - start
      var updateList = updateInfo.updateList;
      var updateFields = updateInfo.updateFields;
      for(var i=0;i<updateList.length;++i) {
        var index = $scope.articleListMap[updateList[i].sn];
        if(index < $scope.articleList.length && $scope.articleList [index].sn == updateList[i].sn) {
          if(updateFields) {
            for(var j=0;j<updateFields.length;++j) {
              $scope.articleList [index][updateFields[j]] = updateList[i][updateFields[j]];
            }
          } else {
            $scope.articleList [index] = updateList[i];
          }
        }
      }
      //update article - start
    }
    
    if(data.length == 0)
      return;
    if(!$scope.articleList || ($scope.articleList && $scope.articleList.length == 0)) {
      $scope.articleList = data;
    } else {
      // if(data[data.length-1].sn < $scope.articleList[0].sn) {
      //   $scope.articleList = data.concat($scope.articleList);
      // } else {
      //   $scope.articleList = $scope.articleList.concat(data);
      // }
      if(data[0].sn < $scope.articleList[$scope.articleList.length-1].sn) {
        $scope.articleList = $scope.articleList.concat(data);
      } else {
        $scope.articleList = data.concat($scope.articleList);
      }
    }

    //keep a maping table - start
    $scope.articleListMap = {};
    for(var i=0;i<$scope.articleList.length;++i)
      $scope.articleListMap[ $scope.articleList[i].sn ] = i;
    //keep a maping table - end

    $scope.$apply();
  };
  
  $scope.onArticleListScrollTop = function () {
    //let robot crawl more list
    $scope.bbsCore.getArticleList({boardName: $scope.currentBoardName,
                                   direction: 'old',
                                   max: $scope.articleList[0].sn,
                                   min: $scope.articleList[$scope.articleList.length-1].sn,
                                   count: 15}); //count: how many articles you needed.
  };

  $scope.refresh = function(done) {
    console.log('refresh');
    //let robot crawl more list
    $scope.bbsCore.getArticleList({boardName: $scope.currentBoardName,
                                   direction: 'new',
                                   max: $scope.articleList[0].sn,
                                   min: $scope.articleList[$scope.articleList.length-1].sn});
    if(done)
      done();
  };

  // $scope.infiniteScrollingDelegate = {
  //   configureItemScope: function(index, itemScope) {
  //     if (!itemScope.article) {
  //       console.log("Created item #" + index);
  //       if(index < $scope.articleList.length) {
  //         itemScope.article = $scope.articleList[index];
  //       }
  //       itemScope.canceler = $q.defer();
  //       $scope.onArticleListScrollTop();
  //     }
  //   },
  //   calculateItemHeight: function(index) {
  //     return 90;
  //   },
  //   countItems: function() {
  //     return $scope.articleList.length;
  //   },
  //   destroyItemScope: function(index, itemScope) {
  //     itemScope.canceler.resolve();
  //     //console.log("Destroyed item #" + index);
  //   }
  // };

  $scope.replyArticle = function (article) {

  };

  $scope.readArticle = function (article) {
    
    //robot crawl all article content.
    //for very long article content that took long time.
    //we need crawl maybe one or two page and waiting user scroll(then crawl more).
    $scope.bbsCore.getArticleContent({boardName: $scope.currentBoardName,
                                      article: article});
                                      
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
  };

  $scope.updateFavoriteList = function (data) {
    $scope.favoriteList = data;
  };
  
  $scope.updateMainUI = function (status) {
    switch (status){
      case "logout":
        $scope.favoriteList = [];
        $scope.$apply();
        break;
      case "login-success":
        break;
      case "disconnect":
        break;
      default:
        break;
    }
  };
  
  $scope.switchChange = function (itemName) {
    switch (itemName){
      case "deleteDuplicate":
        $scope.bbsCore.prefs.savePrefsValue(itemName, !$scope.deleteDuplicate);
        break;
      case "savePassword":
        var spTmp = !$scope.savePassword;
        $scope.bbsCore.prefs.savePrefsValue(itemName, spTmp);
        if(!spTmp) {
          $scope.bbsCore.prefs.savePrefsValue('username', '');
          $scope.bbsCore.prefs.savePrefsValue('password', '');
        }
        break;
      default:
        break;
    }
  };

}]);
