define([], function () {

function TermHtml() {
   this.html='';
   //this.html = [];
}

TermHtml.prototype={

   setHtml: function(str) {
       this.html=str;
   },

   addHtml: function(str) {
       this.html+=str;
   },

   getHtml: function() {
       return this.html;
   }
};
return TermHtml;

});