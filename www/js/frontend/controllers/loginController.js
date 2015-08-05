define(['core/bbsCore'], function (BBSCore) {

var LoginController = function ($scope, $window, gettextCatalog) {

  $scope.init = function() {
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
    $scope.bbsCore.login($scope.sitename, $scope.username, $scope.password, $scope.savePassword);
  };

  $scope.updateMainUI = function (status, message) {
    switch (status){
      case "logout":
        mainNavigator.resetToPage('login.html', { animation: "slide" });
        $scope.errorMessage = '';
        break;
      case "login-success":
        mainNavigator.resetToPage('mainUI.html', { animation: "slide" });
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
};

return LoginController;

});
