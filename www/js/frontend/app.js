define(function(require, exports, module) {

require('angular');
require('angular-sanitize');
require('angular-gettext');
require('onsen');

var AppController = require('frontend/controllers/appController'),
  LoginController = require('frontend/controllers/loginController'),
  TranslateBase = require('frontend/translateBase'),
  BBSCore = require('core/bbsCore');

window.app.bbsCore = new BBSCore();

var app = angular.module('app', ['onsen', 'ngSanitize', 'gettext']);
app.run(TranslateBase);
app.controller('LoginController', LoginController);
app.controller('AppController', AppController);

return app;

});
