require.config({
  // only define libraries here
  paths: {
    angular: '../lib/angular/angular',
    "angular-sanitize": '../lib/angular/angular-sanitize',
    "angular-gettext": '../lib/angular/angular-gettext',
    onsen: '../lib/onsen/js/onsenui'
  },
  shim: {
    "angular": {
      exports: "angular"
    },
    "angular-sanitize": ["angular"],
    "angular-gettext": ["angular"],
    "onsen": ["angular"],
    'frontend/translations': ['frontend/app']
  }
});

(function () {
  "use strict";

  window.app = {
      bbsCore: null
  };

  function onDeviceReady() {
    // Handle the Cordova pause and resume events
    //document.addEventListener( 'pause', onPause.bind(this), false );
    //document.addEventListener( 'resume', onResume.bind(this), false );
    require([
      'frontend/app',
      'frontend/translations',
      'sites/ptt',
      '../lib/domReady!'
      ], function () {

      // TODO: replace visibility into a loading indicator
      document.body.style.visibility = "";
      angular.bootstrap(document, ['app']);

    });
  }

  function onPause() {
    // TODO: This application has been suspended. Save application state here.
  }

  function onResume() {
    // TODO: This application has been reactivated. Restore application state here.
  }

  function onLoad() {

  }

  function onUnload() {
    //TODO: disconnect
  }

  document.addEventListener('deviceready', onDeviceReady.bind(this), false);
  //window.addEventListener('load', onLoad.bind(this), false);
  //window.addEventListener('unload', onUnload.bind(this), false);
}) ();
