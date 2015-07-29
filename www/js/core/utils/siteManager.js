define([], function () {

  var siteManager = {
    siteData: {},

    regSite: function(siteName, siteData){
      this.siteData[siteName] = siteData;
    },

    getSite: function(siteName){
      return this.siteData[siteName];
    }
  };

  return siteManager;
});