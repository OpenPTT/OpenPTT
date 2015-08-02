define([
  'frontend/controllers/appController',
  'frontend/controllers/loginController',
  'frontend/translations',
  'angular',
  'angular-sanitize',
  'angular-gettext',
  'onsen'], function (AppController, LoginController, Translations) {

var app = angular.module('app', ['onsen', 'ngSanitize', 'gettext']);

app.run(Translations);
app.controller('LoginController', LoginController);
app.controller('AppController', AppController);

return app;

});
