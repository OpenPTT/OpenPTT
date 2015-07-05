angular.module('app', ['onsen']);

angular.module('app').controller('AppController', function ($scope, $window) {
  $scope.bbsCore = null;
  $scope.nickname = '';
  $scope.currentBoardName = '';
  $scope.favoriteList = [];
  $scope.articleListMap = {};

  $scope.init = function() {
    $scope.bbsCore = $window.app.bbsCore = new BBSCore();
    $scope.username = $scope.bbsCore.prefs.username;
    $scope.password = $scope.bbsCore.prefs.password;
    $scope.savePassword = $scope.bbsCore.prefs.savePassword;
    
    $scope.deleteDuplicate = $scope.bbsCore.prefs.deleteDuplicate;
    $scope.savePassword = $scope.bbsCore.prefs.savePassword;
    
    $scope.bbsCore.regFavoriteListEvent($scope.updateFavoriteList);
    $scope.bbsCore.regConnectionStatusEvent($scope.updateMainUI);
    $scope.bbsCore.regArticleListEvent($scope.updateArticleList);
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
    $scope.running = true;
    $scope.bbsCore.login($scope.username, $scope.password, $scope.savePassword);
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
      if(data[data.length-1].sn < $scope.articleList[0].sn) {
        $scope.articleList = data.concat($scope.articleList);
      } else {
        $scope.articleList = $scope.articleList.concat(data);
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
                                   min: $scope.articleList[0].sn,
                                   max: $scope.articleList[$scope.articleList.length-1].sn});
  };

  $scope.onArticleListScrollBotton = function () {
    //let robot crawl more list
    $scope.bbsCore.getArticleList({boardName: $scope.currentBoardName,
                                   direction: 'new',
                                   min: $scope.articleList[0].sn,
                                   max: $scope.articleList[$scope.articleList.length-1].sn});
  };

  $scope.updateFavoriteList = function (data) {
    $scope.favoriteList = data;
  };
  
  $scope.updateMainUI = function (status) {
    switch (status){
      case "logout":
        $scope.running = false;
        $scope.favoriteList = [];
        $scope.$apply();
        break;
      case "login":
        $scope.running = false;
        //$scope.$apply();
        mainNavigator.pushPage('mainUI.html');
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

});