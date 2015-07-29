define(function(require, exports, module) {
  var ArticlePtt = require('core/sites/ptt/objects/article'),
   BoardPtt = require('core/sites/ptt/objects/board'),
   MailPtt = require('core/sites/ptt/objects/mail');

function StringParserPtt(bbsCore) {
  this.bbsCore = bbsCore;
}

StringParserPtt.prototype={

  parseBoardData: function (str1, str2) {
    var isHidden = false;
    var regex = new RegExp(/\u25cf?\s{0,7}(\d{0,7})\s{1,2}[\u02c7 ]([\w -]{12})\s(.{1,4})\s([\u25ce\u25cf\u03a3\u25A1])(.*)/g);
    var result = regex.exec(str1);
    if(result && result.length == 6) {
      var boardName = result[2].replace(/^\s+|\s+$/g,'');
      if(boardName == '0ClassRoot' || boardName == 'FPGinPTT')
        isHidden = true;
      var isDirectory = false;
      if(result[4] == '\u03a3' || (result[4] == '\u25A1' && boardName =='MyFavFolder'))
        isDirectory = true;

      return new BoardPtt(this.bbsCore,
                          parseInt(result[1]), //sn
                          boardName, //boardName
                          result[3], //bClass
                          result[5], //description
                          isDirectory, //isDirectory
                          isHidden, //isHidden
                          str2.replace(/^\s+|\s+$/g,'') //popular
                          );
    }
    var regex2 = new RegExp(/\u25cf?\s{0,7}(\d{0,7})X\s{0,1}[\u02c7 ]([\w -]{12})\s(\[\u96B1\u677F\])\s([\u25ce\u25cf\u03a3 ])(.*)/g);
    result = regex2.exec(str1);
    if(result && result.length == 6) {
      return new BoardPtt(this.bbsCore,
                          parseInt(result[1]), //sn
                          result[2].replace(/^\s+|\s+$/g,''), //boardName
                          result[3].replace(/^\[|\]$/g,''), //bClass
                          result[5], //description
                          false, //isDirectory
                          true, //isHidden
                          '' //popular
                          );
    }
    var regex3 = new RegExp(/\u25cf?\s{0,7}(\d{0,7}) {3}-{12} {6}-*/g);
    result = regex3.exec(str1);
    if(result && result.length==2) {
      return new BoardPtt(this.bbsCore,
                          parseInt(result[1]), //sn
                          'splitline', //boardName
                          '', //bClass
                          '', //description
                          false, //isDirectory
                          true, //isHidden
                          '' //popular
                          );
    }
    return null;
  },

  parseArticleData: function (str1, str2) {
    var regex = new RegExp(/((?:(?:\d+)|(?:  \u2605 ))) [\u002bmMsSD*!=~ ]((?:(?:[X\d ]{2})|(?:\u7206))[\d ])(\d\/\d{2}) ([\w-]+) +/g);
    var result = regex.exec(str1);
    var regex2 = new RegExp(/([\u25a1\u02c7\u8f49R]:?) (\[.{2,6}\])?(.*)/g);
    var result2 = regex2.exec(str2);

    if(result && result.length == 5 && result2 && result2.length == 4) {
      var snStr = result[1].replace(/^\s+|\s+$/g,'');
      if(snStr=='\u2605') snStr = '0';
      var aClass = (typeof result2[2] == 'undefined') ? '' : result2[2];
      if(aClass != '')
        aClass = aClass.replace(/^\[|\]$/g,'');
      var title  = result2[1] + result2[3];
      //result2[1] //框/轉/R:
      var popular = result[2].replace(/^\s+|\s+$/g,'');
      var level = 0;
      if(popular == '\u7206')
        level = 3;
      else if(popular == '')
        level = 0;
      else if(typeof popular=='string' && popular.indexOf('X')!=-1)
        level = -1;
      else if(parseInt(popular)>9)
        level = 2;
      else if(parseInt(popular)>0)
        level = 1;

      return new ArticlePtt(this.bbsCore,
                            parseInt(snStr), //sn
                            result[3], //date
                            result[4], //author, if article be deleted, this field will be '-'.
                            popular,
                            aClass,
                            title,
                            level );
    }
    return null;
  },

  parseMailData: function (str) {
    //too many case... :(

    var regex = new RegExp(/\u25CF? {0,5}(\d{1,6}) [rD ] {1,2}(\d{1,2}\/\d{1,2}) (\w{2,14}) {1,13}(.*)/g);
    var result = regex.exec(str);
    if(result) {
      return new MailPtt(
        this.bbsCore,
        parseInt(result[1]),
        result[2],
        result[3],
        result[4]);
    }
    var regex2 = new RegExp(/\u25CF? {0,5}(\d{1,6}) [rD ] {1,2}(\d{1,2}\/\d{1,2}) (\[.{1,10}\]) {1,13}\u25C7 (.*)/g);
    result = regex2.exec(str);
    if(result) {
      return new MailPtt(
        this.bbsCore,
        parseInt(result[1]),
        result[2],
        result[3],
        result[4]);
    }
    return null;
  },

  parseAid: function (str) {
    var regex = new RegExp(/\u2502 \u6587\u7AE0\u4EE3\u78BC\(AID\): #([\w\-]{8}) \(([\w -]{2,12})\).*/g);
    var result = regex.exec(str);
    if(result && result.length == 3) {
      return {aid: result[1],
              boardName: result[2]};
    }
    return null;
  },

  parseArticleHeader: function (str) {
    var regex = new RegExp(/ \u4F5C\u8005  (\w{1,12}) \(.{0,23}\)\s{0,70}\u770B\u677F  ([\w -]{2,12})/g);
    var result = regex.exec(str);
     if(result && result.length == 3) {
       return {author: result[1],
               boardName: result[2]};
     }
     return null;
  },

  parseArticleStatus: function (str) {
    var regexShort = new RegExp(/  \u700F\u89BD \u7B2C {0,3}(\d{1,4}) {0,3}\u9801 {0,2}\( {0,3}(\d{1,3})%\) {0,3}\u76EE\u524D\u986F\u793A: {0,2}\u7B2C {0,2}(\d{1,4})~(\d{1,4}) {0,2}\u884C.*/g);
    var result = regexShort.exec(str);
    if (result && result.length == 5) {
      return {
        pageNow: parseInt(result[1]),
        pageTotal: 0,
        pagePercent: parseInt(result[2]),
        rowIndexStart: parseInt(result[3]),
        rowIndexEnd: parseInt(result[4])
      };
    }
    var regexFull = new RegExp(/  \u700F\u89BD \u7B2C {0,3}(\d{1,4})\/(\d{1,4}) {0,3}\u9801 {0,2}\( {0,3}(\d{1,3})%\) {0,3}\u76EE\u524D\u986F\u793A: {0,2}\u7B2C {0,2}(\d{1,4})~(\d{1,4}) {0,2}\u884C.*/g);
    result = regexFull.exec(str);
    if (result && result.length == 6) {
      return {
        pageNow: parseInt(result[1]),
        pageTotal: parseInt(result[2]),
        pagePercent: parseInt(result[3]),
        rowIndexStart: parseInt(result[4]),
        rowIndexEnd: parseInt(result[5])
      };
    }
    return null;
  },

  parseTotalMail: function (str) {
    var str2 = str.replace(/\s/g, '');
    var regex = new RegExp(/\u7DE8\u865F\u65E5\u671F\u4F5C\u8005\u4FE1\u4EF6\u6A19\u984C\(\u5BB9\u91CF:(\d{1,4})\/(\d{1,4})\u7BC7\)/g);
    var result = regex.exec(str2);
    if(result && result.length ==3) {
      return {
        total: parseInt(result[1]),
        max: parseInt(result[2])
      };
    }
    return null;
  },

  parseArticleClass:function (str) {
    var regex = new RegExp(/\u7A2E\u985E\uFF1A.*\((\d)-(\d)\u6216\u4E0D\u9078\)\s*/g);
    var result = regex.exec(str);
    if (result && result.length==3) {
      var classList = [];
      var start = parseInt(result[1]);
      var end = parseInt(result[2]);
      for(var i=start; i<=end; ++i) {
        var classRegex = new RegExp('.*'+String(i)+'\\.(.{1,4}) .*', 'g');
        var result2 = classRegex.exec(str);
        if(result2 && result2.length==2){
          classList.push(result2[1]);
        } else {
          //bug?
        }
      }
      return classList;
    }
    return null;
  },

  parseArticlePageInfo:function (str) {
    var regexShort = new RegExp(/  \u700F\u89BD \u7B2C {0,3}(\d{1,4}) {0,3}\u9801 {0,2}\( {0,3}(\d{1,3})%\) {0,3}.*/g);
    var result = regexShort.exec(str);
    if (result) {
      return {
        pageNow: parseInt(result[1]),
        pageTotal: 0,
        pagePercent: parseInt(result[2])
      };
    }
    var regexFull = new RegExp(/  \u700F\u89BD \u7B2C {0,3}(\d{1,4})\/(\d{1,4}) {0,3}\u9801 {0,2}\( {0,3}(\d{1,3})%\) {0,3}.*/g);
    result = regexFull.exec(str);
    if (result) {
      return {
        pageNow: parseInt(result[1]),
        pageTotal: parseInt(result[2]),
        pagePercent: parseInt(result[3])
      };
    }
    return null;
  },

  getLastPage: function (str) {
    var regex = new RegExp(/  \u700F\u89BD \u7B2C {0,3}([\d\/]{1,3}) {0,3}\u9801 {0,2}\( {0,3}(\d{1,3})%\) {0,3}.*/g);
    var result = regex.exec(str);
    if(result && result.length == 3) {
      if(parseInt(result[2]) == 100) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  },

  getDefaultSignature: function (str) {
    var regex = new RegExp(/\u8ACB\u9078\u64C7\u7C3D\u540D\u6A94 \(1-9, 0=\u4E0D\u52A0 x=\u96A8\u6A5F\)\[(\d)\].*/g);
    var result = regex.exec(str);
    if (result && result.length==2) {
      return parseInt(result[1]);
    }
    return 0;
  },

  getErrorLogin: function(str) {
    return (str.indexOf('密碼不對或無此帳號。請檢查大小寫及有無輸入錯誤。') >= 0);
  },

  getDuplicatedLogin: function(str) {
    return (str.indexOf('您想刪除其他重複登入的連線嗎') >= 0);
  },

  getErrorLoginLogs: function(str) {
    return (str.indexOf('您要刪除以上錯誤嘗試的記錄嗎') >= 0);
  },

  getPressAnyKeyText: function(str) {
    return (str.indexOf('請按任意鍵繼續') >= 0);
  },

  getMainFunctionList: function(str) {
    return (str.indexOf('【主功能表】') >= 0);
  },

  getBoardList: function(str) {
    return (str.indexOf('【看板列表】') >= 0);
  },

  getMailList: function(str) {
    return (str.indexOf('【郵件選單】') >= 0);
  },

  getBoardHeader: function(str, boardName) {
    return ((str.indexOf('【板主') >= 0 || str.indexOf('【徵求中】') >= 0) && str.indexOf('看板《'+boardName+'》') >= 0);
  },

  getExitMessage: function(str) {
    return (str.indexOf('您確定要離開【 批踢踢實業坊 】嗎') >= 0);
  },

  getContentAlertMessage: function(str) {
    return (str.indexOf('▲此頁內容會依閱讀者不同,原文未必有您的資料') >= 0);
  },

  getAnsiAnimateMessage: function(str) {
   return (str.indexOf('★ 這份文件是可播放的文字動畫，要開始播放嗎') >= 0);
  },

  getEditMessage: function(str) {
   return (str.indexOf(' 編輯文章 ') >= 0);
  },

  getSignatureMessage: function(str) {
   return (str.indexOf('請選擇簽名檔') >= 0);
  },

  getEmptyDirectoryMessage: function(str) {
   return (str.indexOf('空目錄，請按 a 新增或用 y 列出全部看板後按 z 增刪') >= 0);
  },

  getLoginPrompt: function() {
    return ['','請輸入代號，或以 guest 參觀',''];
  }

};

return StringParserPtt;

});