angular.module('app', ['onsen']);

angular.module('app').controller('AppController', function ($scope, $window) {
  $scope.page = 'login';
  $scope.bbsCore = null;
  //$scope.savePassword = true;

  $scope.init = function() {
    $scope.bbsCore = $window.app.bbsCore = new BBSCore();
    $scope.username = $scope.bbsCore.prefs.username;
    $scope.password = $scope.bbsCore.prefs.password;
    $scope.savePassword = $scope.bbsCore.prefs.savePassword;
  };

  $scope.doSomething = function () {
    ons.notification.alert({ message: 'tapped' });
  };

  $scope.login = function () {

    $scope.bbsCore.login($scope.username, $scope.password, $scope.savePassword);
    $scope.page = 'main';
  };

});