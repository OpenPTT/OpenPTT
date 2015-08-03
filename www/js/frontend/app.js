define([
  'frontend/controllers/appController',
  'frontend/controllers/loginController',
  'frontend/translateBase',
  'angular',
  'angular-sanitize',
  'angular-gettext',
  'onsen'], function (AppController, LoginController, TranslateBase) {

var app = angular.module('app', ['onsen', 'ngSanitize', 'gettext']);

app.run(TranslateBase);
app.controller('LoginController', LoginController);
app.controller('AppController', AppController);

return app;

});
