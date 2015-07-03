angular.module('app', ['onsen']);

angular.module('app').controller('AppController', function ($scope, $window) {
  $scope.page = 'login';
  $scope.bbsCore = null;
  $scope.nickname = '';

  $scope.init = function() {
    $scope.bbsCore = $window.app.bbsCore = new BBSCore();
    $scope.username = $scope.bbsCore.prefs.username;
    $scope.password = $scope.bbsCore.prefs.password;
    $scope.savePassword = $scope.bbsCore.prefs.savePassword;
    
    $scope.deleteDuplicate = $scope.bbsCore.prefs.deleteDuplicate;
    $scope.savePassword = $scope.bbsCore.prefs.savePassword;
    
    $scope.bbsCore.regFavoriteListEvent($scope.updateFavoriteList);
    $scope.bbsCore.regConnectionStatusEvent($scope.updateMainUI);
  };

  $scope.doSomething = function () {
    ons.notification.alert({ message: 'tapped' });
  };

  $scope.login = function () {
    $scope.bbsCore.login($scope.username, $scope.password, $scope.savePassword);
    $scope.page = 'main';
  };

  $scope.logout = function () {
    $scope.bbsCore.logout();
  };

  $scope.updateFavoriteList = function (data) {
    $scope.favoriteList = data;
  };
  
  $scope.updateMainUI = function (status) {
    switch (status){
      case "logout":
        $scope.page = 'login';
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
    $scope.favoriteList = data;
  };

});