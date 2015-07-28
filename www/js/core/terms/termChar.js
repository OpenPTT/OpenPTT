define([], function () {

function TermChar(ch) {
    this.ch=ch;
    this.resetAttr();
    this.needUpdate=false;
    this.isLeadByte=false;
    this.startOfURL=false;
    this.endOfURL=false;
    this.partOfURL=false;
    this.fullurl='';
    this.boardName='';
    this.aidc='';
}

// static variable for all TermChar objects
TermChar.defaultFg = 7;
TermChar.defaultBg = 0;

TermChar.prototype={
    copyFrom: function(attr) {
        this.ch=attr.ch;
        this.isLeadByte=attr.isLeadByte;
        this.copyAttr(attr);
    },
    copyAttr: function(attr) {
        this.fg=attr.fg;
        this.bg=attr.bg;
        this.bright=attr.bright;
        this.invert=attr.invert;
        this.blink=attr.blink;
        this.underLine=attr.underLine;
    },
    resetAttr: function() {
        this.fg=7;
        this.bg=0;
        this.bright=false;
        this.invert=false;
        this.blink=false;
        this.underLine=false;
    },
    getFg: function() {
        if(this.invert)
            return this.bright ? (this.bg + 8) : this.bg;
        return this.bright ? (this.fg + 8) : this.fg;
    },
    getBg: function() {
        return this.invert ? this.fg : this.bg;
    },

    isBlink: function() {
        return this.blink;
    },

    isUnderLine: function() {
        return this.underLine;
    },

    isStartOfURL : function() {
       return this.startOfURL;
    },

    isEndOfURL : function() {
       return this.endOfURL;
    },

    isPartOfURL : function() {
       return this.partOfURL;
    },

    //isPartOfKeyWord : function() {
    //   return this.partOfKeyWord;
    //},

    //getKeyWordColor : function() {
    //   return this.keyWordColor;
    //},

    getFullURL: function() {
        return this.fullurl;
    },

    getBoardName: function() {
        return this.boardName;
    },

    getAidc: function() {
        return this.aidc;
    }
};

return TermChar;

});