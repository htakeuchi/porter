(function() {
  var g = window.textCounter_g;
  if (g) {
    $("#textCountDart, #textCounter").remove();
    clearInterval(g.textCounting);
    window.textCounter_g = null;
    return;
  }
  g = window.textCounter_g = {};
  var countText = function() {
    if (!g.$textCountee) return;
    var text = g.$textCountee.find(".name>.content").text();
    $("#textCounter").html(text.substring(0,10)+(text.length>10?"…":"") + " : " + text.length);
  };
  
  var styles = {
    "font-size" : "13px",
    color : $("#helpButton").css("color"),
    "background-image" : $("#header").css("background-image"),
    "background-color" : $("#header").css("background-color"),
    float : "right"
  };

  styles["padding"] = "8px 20px 8px 0px";
  $('<div id="textCounter">←Click to count!</div>').css(styles).appendTo($("#header"));
  
  styles["padding"] = "8px 0px 8px 10px";
  $('<div id="textCountDart">🎯</div>').css(styles).click(function(){
    var $content = $(getSelection().focusNode.parentNode);
    if (!$content) return;
    g.$textCountee = $content.parents().filter(".project").first();
    countText();
  }).appendTo($("#header"));
  
  g.textCounting = setInterval(countText,1000);
})();
