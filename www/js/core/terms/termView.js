// Terminal View
define([
  'core/terms/termHtml',
  'core/uao/uao_conv',
  'core/utils/symbolTable'], function (TermHtml, uaoConv, symboltable) {

function TermView(bbsCore, buf) {
  this.bbsCore = bbsCore;
  this.buf = buf;

  this.deffg = 7;
  this.defbg = 0;

  this.curFg = 7;
  this.curBg = 0;
  this.curBlink = false;
  this.openSpan = false;

  this.curRow = 0;
  this.curCol = 0;

  this.outputhtmls = [];//new TermHtml();
  for(var i=0; i<80; ++i) {
    this.outputhtmls.push(new TermHtml());
  }

  this.symtable = symboltable;
}

TermView.prototype = {
  createNormalWord: function(ch, ch2, char1, fg, bg, forceWidth) {
    var row = this.curRow;
    var col = this.curCol;
    var s1 = '';
    if ((this.openSpan && (fg == this.curFg && bg == this.curBg && ch.blink == this.curBlink)) && forceWidth === 0) {
      return char1;
    }

    s1 += this.closeSpanIfIsOpen();
    if (fg == this.deffg && bg == this.defbg && !ch.blink && forceWidth === 0) { // default colors
      this.setCurColorStyle(fg, bg, false);
      s1 += char1;
    } else if (forceWidth === 0) { // different colors, so create span
      this.setCurColorStyle(fg, bg, ch.blink);
      s1 += '<span class="q' +fg+ ' b' +bg+'">';
      s1 += (ch.blink?'<x s="q'+fg+' b'+bg+'" h="qq'+bg+'"></x>':'') + char1;
      this.openSpan = true;
    } else { // different colors, create span and set current color to default because forceWidth
      this.setCurColorStyle(this.deffg, this.defbg, false);
      s1 += '<span class="wpadding q' +fg+ ' b' +bg+'" ';
      s1 += 'style="display:inline-block;width:'+forceWidth+'px;"' +'>' + (ch.blink?'<x s="q'+fg+' b'+bg+'" h="qq'+bg+'"></x>':'') + char1 + '</span>';
    }
    return s1;
  },

  createNormalChar: function(ch, char1, fg, bg) {
    var row = this.curRow;
    var col = this.curCol;
    var useHyperLink = false;//this.useHyperLink;
    var s0 = '';
    var s1 = '';
    var s2 = '';
    if (ch.isStartOfURL() && useHyperLink) {
      s0 += this.closeSpanIfIsOpen();
      s0 += '<a scol="'+col+'" class="y q'+this.deffg+' b'+this.defbg+'" href="' +ch.getFullURL() + '" rel="noreferrer" target="_blank" srow="'+row+'">';
      this.setCurColorStyle(this.deffg, this.defbg, false);
    }
    if (ch.isEndOfURL() && useHyperLink) {
      s2 = '</a>';
    }

    if (this.openSpan && (bg == this.curBg && (fg == this.curFg || char1 <= ' ') && ch.blink == this.curBlink)) {
      s1 += this.getHtmlEntitySafe(char1);
    } else if (bg == this.defbg && (fg == this.deffg || char1 <= ' ') && !ch.blink) {
      s1 += this.closeSpanIfIsOpen();
      this.setCurColorStyle(fg, bg, false);
      s1 += this.getHtmlEntitySafe(char1);
    } else {
      s1 += this.closeSpanIfIsOpen();
      this.setCurColorStyle(fg, bg, ch.blink);
      s1 +='<span '+ (ch.isPartOfURL()?'link="true" ':'') +'class="q' +fg+ ' b' +bg+ '">'+ (ch.blink?'<x s="q'+fg+' b'+bg+'" h="qq'+bg+'"></x>':'');
      this.openSpan = true;
      s1 += this.getHtmlEntitySafe(char1);
    }
    if (s2) {
      this.setCurColorStyle(this.deffg, this.defbg, false);
      s1 += this.closeSpanIfIsOpen();
    }
    return s0+s1+s2;
  },

  determineAndSetHtmlForCol: function(line, outhtml) {
    var ch = line[this.curCol];
    var curColOutHtml = outhtml[this.curCol];

    var fg = ch.getFg();
    var bg = ch.getBg();
    //bg = 0;
    //if (this.doHighlightOnCurRow) {
    //  this.defbg = this.highlightBG;
    //  bg = this.highlightBG;
    //}

    if (ch.isLeadByte) { // first byte of DBCS char
      var col2 = this.curCol + 1;
      if (col2 < this.buf.cols) {
        var ch2 = line[col2];
        var curColOutHtml2 = outhtml[col2];
        var fg2 = ch2.getFg();
        var bg2 = ch2.getBg();
        var spanstr1 = '';
        var spanstr2 = '';
        //if (this.doHighlightOnCurRow) {
        //  bg2 = this.highlightBG;
        //}

        if (ch2.ch=='\x20') { //a LeadByte + ' ' //we set this in '?' + ' '
          spanstr1 = this.createNormalChar(ch, '?', fg, bg);
          spanstr2 = this.createNormalChar(ch, ' ', fg2, bg2);
        } else { //maybe normal ...
          var b5 = ch.ch + ch2.ch; // convert char to UTF-8 before drawing
          var u = (this.charset == 'UTF-8' || b5.length == 1) ? b5 : uaoConv.b2u(b5);
          if (u) { // can be converted to valid UTF-8
            if (u.length == 1) { //normal chinese word
              var code = this.symtable['x'+u.charCodeAt(0).toString(16)];
              if (code == 3) { //[4 code char]
                spanstr1 = this.createNormalChar(ch, '?', fg2, bg2);
                spanstr2 = this.createNormalChar(ch2, '?', fg2, bg2);
              } else {
                var forceWidth = 0;
                if (code == 1 || code == 2) {
                  forceWidth = this.chh;
                }
                //if (bg != bg2 || fg != fg2 || ch.blink != ch2.blink ) {
                //  spanstr1 = this.createTwoColorWord(ch, ch2, u, fg, fg2, bg, bg2, forceWidth);
                //} else {
                  spanstr1 = this.createNormalWord(ch, ch2, u, fg, bg, forceWidth);
                //}
              }
            } else { //a <?> + one normal char // we set this in '?' + ch2
              spanstr1 = this.createNormalChar(ch, '?', fg, bg);
              spanstr2 = this.createNormalChar(ch, ch2.ch, fg2, bg2);
            }
          }
        }
        curColOutHtml.setHtml(spanstr1);
        curColOutHtml2.setHtml(spanstr2);
        ch2.needUpdate = false;
      }
      this.curCol = col2;
    } else { // NOT LeadByte
      var spanstr = this.createNormalChar(ch, ch.ch, fg, bg);
      curColOutHtml.setHtml(spanstr);
    }
    ch.needUpdate = false;

  },

  getRowHtmlCode: function(row) {
    var cols = this.buf.cols;
    //var rows = this.buf.rows;
    var lines = this.buf.lines;
    //var outhtmls = this.buf.outputhtmls;
    this.curRow = row;
    // resets color
    this.setCurColorStyle(this.deffg, this.defbg, false);
    this.defbg = 0;
    var line = lines[row];
    var outhtml = this.outputhtmls;
    for (this.curCol = 0; this.curCol < cols; ++this.curCol) {
      this.determineAndSetHtmlForCol(line, outhtml);
    }
    outhtml[this.curCol-1].addHtml(this.closeSpanIfIsOpen());
    //outhtml[this.curCol-1].addHtml(this.closeSpanIfIsOpen());
    var tmp = [];
    for (var j = 0; j < cols; ++j)
      tmp.push(outhtml[j].getHtml());
    return tmp.join('');
  },

  closeSpanIfIsOpen: function() {
    var output = '';
    if (this.openSpan) {
      output += '</span>';
      this.openSpan = false;
    }
    return output;
  },

  setCurColorStyle: function(fg, bg, blink) {
    this.curFg = fg;
    this.curBg = bg;
    this.curBlink = blink;
  },

  getHtmlEntitySafe: function(inputChar) {
    if (inputChar <= ' ' || inputChar == '\x80') // only display visible chars to speed up
      return ' ';
    else if (inputChar == '\x3c')
      return '&lt;';
    else if (inputChar == '\x3e')
      return '&gt;';
    else if (inputChar == '\x26')
      return '&amp;';
    else
      return inputChar;
  }

};

return TermView;

});

