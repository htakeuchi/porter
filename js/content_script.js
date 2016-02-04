(function(global) {
  var g_timerID;
  var g_textCountFlag;
  var g_CounterMsg = 'Click to count';
  var g_sideBar;
  
  function elementsToArray(node) {
    var list = [];
    var e = node.querySelectorAll('div.project div.name, div.project div.notes, div.children div.childrenEnd');
    // title in first line
    list.push({title: e[0].textContent, type: 'title'});
    // notes in first line
    var text = e[1].getElementsByClassName("content")[0];
    if (text.textContent.length > 1) {
      list.push({title: text.textContent.replace(/\n+$/g,''), type: 'note'});
    }

    for (var i = 2; i < e.length; i++) {
      if (e[i].matches('div.childrenEnd')) {
        list.push({title: '',  type: 'eoc'});
      } else {
        text = e[i].getElementsByClassName("content")[0];
        if (e[i].className.match('notes') && text.textContent.length > 1) {
          list.push({title: text.textContent.replace(/\n+$/g,''), type: 'note'});
        } else if (e[i].className.match('name')) {
          list.push({title: text.textContent, type: 'node'});
        };
      };
    };
    return list;
  }

  function setCSS(css) {
    if (document.head) {
      var style = document.createElement("style");
      style.innerHTML = css;
      document.head.appendChild(style);
    }
  }

// TODO: 一括してロードする
  function injectCSS() {
    chrome.storage.sync.get("theme_enable", function(storage) {
      if (storage.theme_enable) {
        chrome.storage.sync.get("theme", function(storage) {
          if (storage.theme == "CUSTOM") {
            chrome.storage.sync.get("custom_css", function(storage) {
              setCSS(storage.custom_css);
            });
          } else {
            chrome.storage.sync.get("theme", function(storage) {
              var link = document.createElement("link");
              link.href = chrome.extension.getURL("css/theme/"+storage.theme+".css");
              link.type = "text/css";
              link.rel = "stylesheet";
              document.getElementsByTagName("head")[0].appendChild(link);
            });
          };
        });
      }
    });
  };

  function addTextCounter() {
    var styles = {
      "font-size" : "13px",
      color : '#fff',
      "background-image" : $("#header").css("background-image"),
      "background-color" : $("#header").css("background-color"),
      float : "right"
    };
    styles["padding"] = "8px 20px 8px 0px";
    $('<a></a>', {id: 'textCounter'}).css(styles).appendTo($("#header"));
    $('#textCounter').html(g_CounterMsg);

    jQuery('#textCounter').click(function() {
      if (g_textCountFlag) {
        clearInterval(g_timerID);
        $('#textCounter').html(g_CounterMsg);
      } else {
        textCounter();
        g_timerID = setInterval(textCounter, 1000);
      }
      g_textCountFlag = !g_textCountFlag;
    });
  }

  function textCounter() {
    var content = elementsToArray(document.querySelector('div.selected'));
    var chars = 0;
    for (var i=0; i < content.length; i++) {
      if (content[i].type != 'node') continue;
      chars = chars + content[i].title.length;
    }
    var html = chars + ' letters';
    $('#textCounter').html(html);
  }

  function addSideBar() {
    $('body').append('\
    <div id="dialog" title="Quick Access">\
      <ul>\
      <li><a href="#">Home</a></li>\
      <li><a href="#">Home 2</a></li>\
      <li><a href="#">Home 3</a></li>\
      <li><a href="#">Home 4</a></li>\
      <li><a href="#">Home 5</a></li>\
      <li><a href="#">Home 6</a></li>\
      <li><a href="#">Home 7</a></li>\
      <li><a href="#">Home 8</a></li>\
      <li><a href="#">Home 9</a></li>\
      <li><a href="#">Home 10</a></li>\
      </ul>\
    </div>');
    
    g_sideBar = $( "#dialog" ).dialog({
      height: 'auto',
      width : 300,
      position: {
        of : window,
        at: 'right top',
        my: 'right top'
      }
    });
    g_sideBar.parent().css({position: 'fixed'})
  }

  function main() {
    g_textCountFlag = false;
    // show icon in address bar
    chrome.extension.sendRequest({}, function(res) {});

    $(window).load(function(){
      injectCSS();
      addTextCounter();
//      addSideBar();
    });

    chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
      var content = elementsToArray(document.querySelector('div.selected'));
      var url = location.href;
      var title = document.title;
      sendResponse({content: content, url: url, title: title});
    });
  }
  main();
})();
