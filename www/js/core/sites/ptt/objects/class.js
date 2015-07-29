define(['core/sites/ptt/objects/board'], function (BoardPtt) {

function ClassPtt(bbsCore) {
  this.bbsCore = bbsCore;
  this.robot = bbsCore.robot;
  this.sn = 'c';
  this.boardName = '1ClassRoot';
  this.subBoardList = [];
  this.subBoardListReady = true;
  this.isDirectory = true;
  this.isHidden = false;

  var classBoardInfo = [
    {bClass: '市民廣場',   description: '報告站長 PTT咬我'},
    {bClass: '臺灣大學',   description: '臺大, 臺大, 臺大'},
    {bClass: '政治大學',   description: '政大, 政大, 政大'},
    {bClass: '青蘋果樹',   description: '校園, 班板, 社團'},
    {bClass: '活動中心',   description: '社團, 聚會, 團體'},
    {bClass: '視聽劇場',   description: '偶像, 音樂, 廣電'},
    {bClass: '戰略高手',   description: '遊戲, 數位, 程設'},
    {bClass: '卡漫夢工廠', description: '卡通, 漫畫, 動畫'},
    {bClass: '生活娛樂館', description: '生活, 娛樂, 心情'},
    {bClass: '國家研究院', description: '政治, 文學, 學術'},
    {bClass: '國家體育場', description: '汗水, 鬥志, 膽識'},
  ];
  for(var i=0;i<classBoardInfo.length;++i) {
    var board = new BoardPtt(this.bbsCore,
                          i+1, //sn
                          '1ClassBranch', //boardName
                          classBoardInfo[i].bClass, //bClass
                          classBoardInfo[i].description, //description
                          true, //isDirectory
                          false, //isHidden
                          '' //popular
                          );
    board.path = ['c'];
    this.subBoardList.push(board);
  }
}

ClassPtt.prototype={

};

return ClassPtt;

});