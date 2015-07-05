angular.module('app', ['onsen']);

angular.module('app').controller('AppController', function ($scope, $window) {
  $scope.bbsCore = null;
  $scope.nickname = '';
  $scope.currentBoardName = '';
  $scope.favoriteList = [];

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
    $scope.bbsCore.login($scope.username, $scope.password, $scope.savePassword);
  };

  $scope.logout = function () {
    $scope.bbsCore.logout();
  };

  $scope.updateArticleList = function (data) {
    //TODO: apend list.
    if(!$scope.articleList || ($scope.articleList && $scope.articleList.length == 0)) {
      $scope.articleList = data;
    } else {
      if(data[data.length-1].sn < $scope.articleList[0].sn) {
        $scope.articleList = data.concat($scope.articleList);
      } else {
        $scope.articleList = $scope.articleList.concat(data);
      }
    }
    $scope.$apply();
  };
  
  $scope.onArticleListScrollTop = function () {
    //let robot crawl more list
    $scope.bbsCore.getArticleList({boardName: $scope.currentBoardName,
                                   direction: 'old',
                                   min: $scope.articleList[0].sn});
  };

  $scope.onArticleListScrollBotton = function () {
    //let robot crawl more list
    $scope.bbsCore.getArticleList({boardName: $scope.currentBoardName,
                                   direction: 'new',
                                   max: $scope.articleList[$scope.articleList.length-1].sn});
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