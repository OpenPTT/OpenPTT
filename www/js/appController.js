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


  $scope.boardListStack = [];
  $scope.currentBoard = {};
  $scope.currentBoard.articleList = [];
  $scope.currentBoard.highlightList = [];
  
  $scope.currentDirectory = {};
  $scope.currentDirectory.subBoardList = [];
  
  $scope.currentArticle = {};
  $scope.currentArticle.lines = [];
 
  $scope.init = function() {
    if(!$window.app.bbsCore)
      $window.app.bbsCore = new BBSCore();
    $scope.bbsCore = $window.app.bbsCore;
    $scope.bbsCore.regConnectionStatusEvent($scope.updateMainUI);    
    $scope.bbsCore.setApplyDataEvent($scope.applyDataEvent);
    $scope.favorites = $scope.bbsCore.getFavorite();
  };

  $scope.applyDataEvent = function(subject, obj) {
    if(subject == 'updateArticleContent') {
      if(obj !== $scope.currentArticle)
        return;

      $scope.currentArticle.lines = [];
      for(var i=0;i<obj.content.lines.length;++i) {
        $scope.currentArticle.lines.push({sn: i, html: $sce.trustAsHtml(obj.content.lines[i])});
      }
    }
    $scope.$apply();
  },

  $scope.enterBoard = function (board) {
    if(!board.enter())
      return;

    if(board.isDirectory) {
      if(board.boardName == 'favorite') {

      } else {
        //$scope.boardList = board.subBoardList;
        favoriteNavigator.pushPage('boardList.html');
        $scope.boardListStack.push(board);
        //$scope.boardList = board.subBoardList;
        $scope.currentDirectory = board;
      }
    } else {
      $scope.currentBoardName = board.boardName;
      $scope.currentBoard = board;
      $scope.$apply();
      favoriteNavigator.pushPage('article.html');
      $scope.boardListStack.push({});
      $scope.currentDirectory = {};
      $scope.currentDirectory.subBoardList = [];
    }
  };
  
  $scope.exitBoard = function () {
    console.log('exitBoard');
    $scope.boardListStack.pop();
    if($scope.boardListStack.length > 0)
      $scope.currentDirectory = $scope.boardListStack[$scope.boardListStack.length-1];
    else
      $scope.currentDirectory = {};
  };

  $scope.logout = function () {
    $scope.bbsCore.logout();
  };
  
  $scope.onArticleListScrollTop = function () {
    //let robot crawl more list
    $scope.currentBoard.getOldData(15);
  };

  $scope.refresh = function() {
    console.log('refresh');
    $scope.currentBoard.refresh();
  };

  $scope.replyArticle = function (article) {

  };

  $scope.readArticle = function (article) {
    if(!article.read())
      return;

    $scope.currentArticle = article;
    favoriteNavigator.pushPage('reading.html');
    $scope.boardListStack.push({});
    $scope.currentDirectory = {};
    $scope.currentDirectory.subBoardList = [];
  };

  
  $scope.updateMainUI = function (status) {
    switch (status){
      case "logout":
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
