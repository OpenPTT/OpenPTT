angular.module('app').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('en', {"hihihi":"T_T"});
    gettextCatalog.setStrings('en_US', {"hihihi":"TEST TRANSLATION"});
/* jshint +W100 */
}]);