define([
  'core/uao/uao_u2b_table',
  'core/uao/uao_b2u_table'], function (
    u2bTable,
    b2uTable) {
  var uaoConv = {
    u2b: function(unicode_str) {
      var data = '';
      for (var i = 0; i < unicode_str.length; ++i) {
        if (unicode_str.charAt(i) < '\x80') {
          data += unicode_str.charAt(i);
          continue;
        }
        var charCodeStr = unicode_str.charCodeAt(i).toString(16).toUpperCase();
        charCodeStr = 'x' + ('000' + charCodeStr).substr(-4);
        if (u2bTable[charCodeStr])
          data += u2bTable[charCodeStr];
        else // Not a big5 char
          data += '\xFF\xFD';
      }
      return data;
    },
    b2u: function(big5_str) {
      var str = '';
      for (var i = 0; i < big5_str.length; ++i) {
        if (big5_str.charAt(i) < '\x80' || i == big5_str.length-1) {
          str += big5_str.charAt(i);
          continue;
        }

        var b5index = 'x' + big5_str.charCodeAt(i).toString(16).toUpperCase() +
                            big5_str.charCodeAt(i+1).toString(16).toUpperCase();
        if (b2uTable[b5index]) {
          str += b2uTable[b5index];
          ++i;
        } else { // Not a big5 char
          str += big5_str.charAt(i);
        }
      }
      return str;
    }
  };
  return uaoConv;
});
