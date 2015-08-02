angular.module('app').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('en', {"Close":"Close","Login":"Login"});
    gettextCatalog.setStrings('zh_TW', {"Close":"關閉","Login":"登入"});
/* jshint +W100 */
}]);