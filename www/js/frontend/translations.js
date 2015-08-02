define(function(require, exports, module) {
var translationTexts = {};
translationTexts['en'] = require('translation/en');
translationTexts['zh_TW'] = require('translation/zh_tw');

// FIXME: swichable language support
var lang = window.navigator.userLanguage || window.navigator.language || "";
lang = lang.toLowerCase().match(/^zh/) ? 'zh_TW' : 'en';

var translations = ['gettextCatalog', function (gettextCatalog) {
  gettextCatalog.currentLanguage = lang;
  gettextCatalog.debug = true;
  gettextCatalog.setStrings(lang, translationTexts[lang]);
}];

return translations;

});
