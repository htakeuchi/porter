var Util = (function () {
  return {
    // public method
    escapeHtml: function(content) {
      var TABLE_FOR_ESCAPE_HTML = {
        "&": "&amp;",
        "\"": "&quot;",
        "<": "&lt;",
        ">": "&gt;"
      };
      return content.replace(/[&"<>]/g, function(match) {
        return TABLE_FOR_ESCAPE_HTML[match];
      });
    },
    getUniqueId: function(myStrong) {
      var strong = 1000;
      if (myStrong) strong = myStrong;
      return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
    }
  }
})();
