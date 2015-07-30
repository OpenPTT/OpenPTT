define(['core/utils/stringUtil'], function (strUtil) {
  var robotCmd = {
    Enter: strUtil.UnEscapeStr('^M'),
    Left: '\x1b[D',
    Right: '\x1b[C',
    Up: '\x1b[A',
    Down: '\x1b[B',
    PgUp: '\x1b[5~',
    PgDown: '\x1b[6~',
    Home: '\x1b[1~',
    End: '\x1b[4~',
    CtrlZ: '\x1a',
    CtrlP: '\x10'
  };
  return robotCmd;
});