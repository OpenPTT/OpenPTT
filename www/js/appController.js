angular.module('app', ['onsen']);

angular.module('app').controller('LoginController', function ($scope, $window) {
  $scope.init = function() {
    if(!$window.app.bbsCore)
      $window.app.bbsCore = new BBSCore();
    $scope.bbsCore = $window.app.bbsCore;
    
    $scope.username = $scope.bbsCore.prefs.username;
    $scope.password = $scope.bbsCore.prefs.password;
    $scope.savePassword = $scope.bbsCore.prefs.savePassword;

    $scope.bbsCore.regConnectionStatusEvent($scope.updateMainUI);
  };

  $scope.login = function () {
    console.log('$scope.login');
    $scope.bbsCore.login($scope.username, $scope.password, $scope.savePassword);
  };

  $scope.updateMainUI = function (status) {
    switch (status){
      case "logout":
        mainNavigator.popPage('mainUI.html');
        break;
      case "login":
        mainNavigator.pushPage('mainUI.html');
        break;
      case "disconnect":
        break;
      default:
        break;
    }
  };
  
});
angular.module('app').controller('AppController', ['$scope', '$window', '$q', function ($scope, $window, $q) {
  $scope.bbsCore = null;
  $scope.nickname = '';
  $scope.currentBoardName = '';
  $scope.favoriteList = [];
  $scope.articleListMap = {};
 
  $scope.init = function() {
    if(!$window.app.bbsCore)
      $window.app.bbsCore = new BBSCore();
    $scope.bbsCore = $window.app.bbsCore;
    
    $scope.bbsCore.regFavoriteListEvent($scope.updateFavoriteList);
    $scope.bbsCore.regArticleListEvent($scope.updateArticleList);
    $scope.bbsCore.regConnectionStatusEvent($scope.updateMainUI);
  };

  $scope.doSomething = function () {
    ons.notification.alert({ message: 'tapped' });
  };

  $scope.enterBoard = function (board) {
    $scope.articleList = [];
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

  $scope.updateArticleList = function (data, data2) {
    //TODO: we need remove some article for saving memory.
    if(data2 && data2.length) {
      //update article - start
      for(var i=0;i<data2.length;++i) {
        var index = $scope.articleListMap[data2[i].sn];
        if(index < $scope.articleList.length && $scope.articleList [index].sn == data2[i].sn)
          $scope.articleList [index] = data2[i];
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
                                   min: $scope.articleList[$scope.articleList.length-1].sn});
  };

  $scope.refresh = function($done) {
    //console.log('refresh');
    //let robot crawl more list
    $scope.bbsCore.getArticleList({boardName: $scope.currentBoardName,
                                   direction: 'new',
                                   max: $scope.articleList[0].sn,
                                   min: $scope.articleList[$scope.articleList.length-1].sn});
    $done();
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

    
  $scope.updateFavoriteList = function (data) {
    $scope.favoriteList = data;
  };
  
  $scope.updateMainUI = function (status) {
    switch (status){
      case "logout":
        $scope.favoriteList = [];
        $scope.$apply();
        break;
      case "login":
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