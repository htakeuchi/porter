/* global bookMarks */
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

  function injectCSS() {
    chrome.storage.sync.get(["theme_enable", "theme", "custom_css"], function (option) {
      if (!option.theme_enable) return;

      if (option.theme != "CUSTOM") {
        var link = document.createElement("link");
        link.href = chrome.extension.getURL("css/theme/"+option.theme+".css");
        link.type = "text/css";
        link.rel = "stylesheet";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      if (option.custom_css.length > 0) setCSS(option.custom_css);
    });
  }

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

  function getHtml(list){
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var url = list[i].url;
      var title = list[i].title.replace(/ - WorkFlowy$/, '');
      html = html.concat('<li><a href="' + url + '">' + title + '</a></li>');
    }
    return html;
  }

  function replaceSideBar()
  {
    var bookmarks;
    chrome.storage.sync.get(["bookmark_enable", "bookmarks"], function (option) {
      if (option.bookmark_enable) {
        if (!option.bookmarks) {
console.log('NO BOOKMARK');
          bookmarks = [{ label: 'WorkFlowy', id: 1234567, children: [
            { label: 'HOME', url: 'https://workflowy.com/#'}
          ]}];
        } else {
console.log('GET BOOKMARK ' + option.bookmarks);
          bookmarks = JSON.parse(option.bookmarks);
        }
console.log(bookmarks);
      // ツリーの構築
        var html = '<div class="title ui-dialog-titlebar ui-widget-header">Bookmark</div><div id="bookmark_area"></div>';

        $('#keyboardShortcutHelper').html(html);
        $('#bookmark_area').tree({
          dragAndDrop: true,
          autoOpen: 0,
          keyboardSupport: false,
          data: bookmarks
        });
        // ブックマーククリック時の処理
        $('#bookmark_area').bind('tree.click',
          function(event) {
            var node = event.node;
            if (typeof node.url !== "undefined") location.href = node.url;
          }
        );
        // ツリー移動時の処理
        $('#bookmark_area').bind('tree.move', function(event) {
  console.log('tree moved');
        　setTimeout(function() {
            var tree = $('#bookmark_area');
            chrome.storage.sync.set({
              'bookmarks': tree.tree('toJson')
            });
          }, 1000);
        });
      }
    });
  }

  function getContent(callback) {
    var content = elementsToArray(document.querySelector('div.selected'));
    var url = location.href;
    var title = document.title;
    callback({content: content, url: url, title: title});
  }

  function addBookmark(url, title) {
console.log("ADD BOOKMARK:" + url + title);
    var tree = $('#bookmark_area');
    var parent_node = tree.tree('getNodeById', 1234567);
console.log(parent_node);
    title = title.replace(/\s\-\sWorkFlowy$/, '');
    tree.tree('appendNode', { label: title, url: url }, parent_node);

console.log('save');
console.log(tree.tree('toJson'));

    chrome.storage.sync.set({
      'bookmarks': tree.tree('toJson')
    });
  }


  function main() {
    g_textCountFlag = false;

    // show icon in address bar
    chrome.extension.sendRequest({type: 'showIcon'}, function() {});

    $(document).ready(function(){
      injectCSS();
    });

    $(window).load(function(){
      addTextCounter();
      replaceSideBar();
    });

    chrome.extension.onMessage.addListener(function(msg, sender, callback) {
console.log(msg);
      switch (msg.request) {
        case 'gettopic':
          getContent(callback);
          break;
        case 'bookmark':
          addBookmark(msg.info.url, msg.info.title);
          break;
      };
    });
  }
  main();
})();
