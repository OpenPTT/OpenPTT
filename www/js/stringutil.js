function ansiHalfColorConv(bufdata) {
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
};