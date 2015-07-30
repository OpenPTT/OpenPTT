define([], function () {

var StrUtil = {
  // concat('a', 'b', 'c') ==> 'abc'
  concat: function () {
    return Array.prototype.slice.call(arguments).join('');
  },

  UnEscapeStr: function(str) {
    var result = '';
    for(var i=0; i<str.length; ++i) {
        switch(str.charAt(i)) {
        case '\\':
            if(i == str.length-1) { // independent \ at the end of the string
                result += '\\';
                break;
            }
            switch(str.charAt(i+1)) {
            case '\\':
                result += '\\\\';
                ++i;
                break;
            case '^':
                result += '^';
                ++i;
                break;
            case 'x':
                if(i > str.length - 4) {
                    result += '\\';
                    break;
                }
                var code = parseInt(str.substr(i+2, 2), 16);
                result += String.fromCharCode(code);
                i += 3;
                break;
            default:
                result += '\\';
            }
            break;
        case '^':
            if(i == str.length-1) { // independent ^ at the end of the string
                result += '^';
                break;
            }
            if('@' <= str.charAt(i+1) && str.charAt(i+1) <= '_') {
                var code = str.charCodeAt(i+1) - 64;
                result += String.fromCharCode(code);
                i++;
            } else if(str.charAt(i+1) == '?') {
                result += '\x7f';
                i++;
            } else {
                result += '^';
            }
            break;
        default:
            result += str.charAt(i);
        }
    }
    return result;
  },

  ansiHalfColorConv: function (bufdata) {
    var str = '';
    var regex = new RegExp('\x15\\[(([0-9]+)?;)+50m', 'g');
    var result = null;
    var indices = [];
    while ((result = regex.exec(bufdata))) {
      indices.push(result.index + result[0].length - 4);
    }

    if (indices.length == 0) {
      return bufdata;
    }

    var curInd = 0;
    for (var i = 0; i < indices.length; ++i) {
      var ind = indices[i];
      var preEscInd = bufdata.substring(curInd, ind).lastIndexOf('\x15') + curInd;
      str += bufdata.substring(curInd, preEscInd) + '\x00' + bufdata.substring(ind+4, ind+5) + bufdata.substring(preEscInd, ind) + 'm';
      curInd = ind+5;
    }
    str += bufdata.substring(curInd);
    return str;
  }
};

return StrUtil;

});
