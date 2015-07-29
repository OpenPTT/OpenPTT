(function () {
    "use strict";

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        //document.addEventListener( 'pause', onPause.bind(this), false );
        //document.addEventListener( 'resume', onResume.bind(this), false );
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
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

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );
    window.addEventListener('load', onLoad.bind(this), false);
    window.addEventListener('unload', onUnload.bind(this), false);

    window.app = {
        bbsCore: null
    };
    window.siteManager = {
        siteData: {},
        regSite: function(siteName, siteData){
          this.siteData[siteName] = siteData;
        },
        getSite: function(siteName){
          return this.siteData[siteName];
        }
    };
}) ();

require.config({
  paths: {
    angular: '../lib/angular/angular',
    "angular-sanitize": '../lib/angular/angular-sanitize',
    onsen: '../lib/onsen/js/onsenui'
  },
  shim: {
    "angular": {
      exports: "angular"
    },
    "angular-sanitize": ["angular"],
    "onsen": ["angular"]
  }
});

require([
  'core/sites/ptt/robot',
  'angular',
  'frontend/appController',
  ], function (RobotPtt) {
  window.RobotPtt = RobotPtt;

  angular.bootstrap(document, ['app']);
});