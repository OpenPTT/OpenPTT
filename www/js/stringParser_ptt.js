function StringParserPtt() {
}

StringParserPtt.prototype={

  parseBoardData: function (str1, str2) {
    var regex = new RegExp(/\u25cf?\s{0,7}(\d{0,7})\s{1,2}[\u02c7 ]([\w ]{12})\s(.{1,4})\s[\u25ce\u25cf\u03a3](.*)/g);
    var result = regex.exec(str1);
    if(result && result.length == 5) {
      return {sn: parseInt(result[1]),
              boardName: result[2].replace(/^\s+|\s+$/g,''),
              bClass: result[3],
              description: result[4],
              popular: str2.replace(/^\s+|\s+$/g,'')};
    }
    return null;
  },

  parseArticleData: function (str1, str2) {
    var regex = new RegExp(/((?:(?:\d+)|(?:  \u2605 ))) [\u002bmMsSD*!=~ ]((?:(?:[X\d ]{2})|(?:\u7206))[\d ])(\d\/\d{2}) ([\w-]+) +/g);
    var result = regex.exec(str1);
    var regex2 = new RegExp(/([\u25a1\u8f49R]:?) (\[.{2,4}\])?(.*)/g);
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
      
      return {sn: parseInt(snStr),
              date: result[3],
              author: result[4], //if article be deleted, this field will be '-'.
              popular: popular,
              aClass: aClass,
              title: title,
              level:level
             };
    }
    return null;
  },

  parseAid: function (str) {
    var regex = new RegExp(/\u2502 \u6587\u7AE0\u4EE3\u78BC\(AID\): #([\w\-]{8}) \((\w{2,12})\).*/g);
    var result = regex.exec(str);
    if(result && result.length == 3) {
      return {aid: result[1],
              boardName: result[2]};
    }
    return null;
  },

  parseArticleHeader: function (str) {
    var regex = new RegExp(/ \u4F5C\u8005  (\w{1,12}) \(.{0,23}\)\s{0,70}\u770B\u677F  (\w{2,12})/g);
    var result = regex.exec(str);
     if(result && result.length == 3) {
       return {author: result[1],
               boardName: result[2]};
     }
     return null;
  },
  
  parseStatusRow: function (str) {
    var regex = new RegExp(/  瀏覽 第 (\d{1,3})(?:\/(\d{1,3}))? 頁 *\( *(\d{1,3})%\)  目前顯示: 第 0*(\d+)~0*(\d+) 行 *(?:\(y\)回應)?(?:\(X\/?%\)推文)?(?:\(h\)說明)? *\(←\/?q?\)離開 /g);
    var result = regex.exec(str);
    if (!result)
      return null;

    if (result.length == 6) {
      return {
        pageIndex:     parseInt(result[1]),
        pageTotal:     parseInt(result[2]),
        pagePercent:   parseInt(result[3]),
        rowIndexStart: parseInt(result[4]),
        rowIndexEnd:   parseInt(result[5])
      };
    }
    return null;
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

  getBoardHeader: function(str, boardName) {
    return ((str.indexOf('【板主') >= 0 || str.indexOf('【徵求中】') >= 0) && str.indexOf('看板《'+boardName+'》') >= 0);
  },

  getExitMessage: function(str) {
    return (str.indexOf('您確定要離開【 批踢踢實業坊 】嗎') >= 0);
  }
};