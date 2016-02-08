(function(global) {
  var g_timerID;
  var g_textCountFlag;
  var g_CounterMsg = 'Click to count';

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

  function replaceSideBar(bookMarks, history) {
    var sidebar = '<h3>Bookmarks</h3><ul class="bookmarklist">';
console.log(bookMarks);    
    bookMarks = bookMarks.sort(function(a,b){
      if( a.title < b.title ) return -1;
      if( a.title > b.title ) return 1;
      return 0;
    }); 
    for (var i = 0; i < bookMarks.length; i++) {
      var url = bookMarks[i].url;
      var title = bookMarks[i].title.replace(/ - WorkFlowy$/, '');
      sidebar = sidebar.concat('<li><a href="' + url + '">' + title + '</a></li>');
    }
    sidebar = sidebar.concat('</ul>');

    sidebar = sidebar.concat('<h3>History</h3><ul class="bookmarklist">');
    for (var i = 0; i < history.length; i++) {
      var url = history[i].url;
      var title = history[i].title.replace(/ - WorkFlowy$/, '');
      sidebar = sidebar.concat('<li><a href="' + url + '">' + title + '</a></li>');
    }
    sidebar = sidebar.concat('</ul>');

    $('#keyboardShortcutHelper').html(sidebar);
  }

  function main() {
    var bookMarks;
    var history;
    
    g_textCountFlag = false;
    // show icon in address bar
    chrome.extension.sendRequest({}, function(contents) {

console.log(contents);
      bookMarks = contents.bookMarks; 
      history = contents.history;
    });

    $(document).ready(function(){
      injectCSS();
    });

    $(window).load(function(){
      addTextCounter();
      replaceSideBar(bookMarks, history);
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
