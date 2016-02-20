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

  function getRootNode() {
    var tree = $('#bookmark_area');
    return {"tree": tree, "node": tree.tree('getNodeById', 1)};
  }

  function addBookmark(url, title) {
    if (typeof url === "undefined") url = location.href;
    if (typeof title=== "undefined") title = document.title;

    var info = getRootNode();
    title = title.replace(/\s\-\sWorkFlowy$/, '');
    info.tree.tree('appendNode', { label: title, url: url }, info.node);
    saveBookmark();
  }

  function addBookmarkFolder() {
    var info = getRootNode();
    var title = window.prompt(chrome.i18n.getMessage('Inputfoldername'), "");
    if (typeof title === "undefined" || title == null) return;

    info.tree.tree('appendNode', { label: title }, info.node);
    saveBookmark();
  }

  function saveBookmark() {
    setTimeout(function() {
      var tree = $('#bookmark_area');
      chrome.storage.sync.set({
        'bookmarks': tree.tree('toJson')
      });
    }, 1000);
  }

  function getSelectedNode() {
    var tree = $('#bookmark_area');
    return tree.tree('getSelectedNode');
  }

  function deleteBookmark() {
    var node = getSelectedNode();
    if (!node) return;
    if (window.confirm(chrome.i18n.getMessage('ConfirmDelete'))) {
      $('#bookmark_area').tree('removeNode', node);
      saveBookmark();
    }
  }

  function editBookmark() {
    var node = getSelectedNode();
    if (!node) return;
    var title = window.prompt(chrome.i18n.getMessage('Edittitle'), node.name);
    if (typeof title === "undefined" || title == null || title.length == 0) return;

    var tree = $('#bookmark_area');
    tree.tree('updateNode', node, title);
    saveBookmark();
  }

  function getSidebarHtml() {
    var m1 = chrome.i18n.getMessage('Folder');
    var m2 = chrome.i18n.getMessage('Edit');
    var m3 = chrome.i18n.getMessage('Delete');
    return '<div class="title ui-dialog-titlebar ui-widget-header">\
    <span>' + chrome.i18n.getMessage('Bookmark') + '<br/>\
    <a href="#" id="addBookmark">&#9825;</a>\
    <a href="#" id="addFolderLink">' + chrome.i18n.getMessage('Folder') + '</a>\
    <a href="#" id="editLink">' + chrome.i18n.getMessage('Edit') + '</a>\
    <a href="#" id="deleteLink"><span id="deleteSpan">' + chrome.i18n.getMessage('Delete')  + '</span></a>\
    </span></div>\
    <div id="bookmark_area"></div>';
  }

  function setSidebarLister() {
    $('#keyboardShortcutHelper').html(getSidebarHtml());
    $('#addBookmark').click(function() {addBookmark(); return false});
    $('#addFolderLink').click(function() {addBookmarkFolder(); return false});
    $('#editLink').click(function() {editBookmark(); return false});
    $('#deleteLink').click(function() {deleteBookmark(); return false});
  }

  function buildSidebarTree(bookmarks) {
    // Build Tree
    var bookmarkArea = $('#bookmark_area');
    bookmarkArea.tree({
      dragAndDrop: true,
      autoOpen: 0,
      keyboardSupport: false,
      data: bookmarks
    });
    bookmarkArea.bind('tree.click',
      function(event) {
        var node = event.node;
        if (typeof node.url !== "undefined") location.href = node.url;
      }
    );
    bookmarkArea.bind('tree.dblclick',
      function(event) {
      }
    );
    bookmarkArea.bind('tree.move', function(event) {
      saveBookmark();
    });
  }

  function replaceSideBar()
  {
    var bookmarks = [];
    chrome.storage.sync.get(["bookmark_enable", "bookmarks"], function (option) {
      if (option.bookmark_enable) {
//        setCSS('#keyboardShortcutHelper {width: 250px;}');
        if (!option.bookmarks) {
        } else {
          bookmarks = JSON.parse(option.bookmarks);
        }
        setSidebarLister();
        buildSidebarTree(bookmarks);
      }
    });
  }

  function getContent(callback) {
    var content = elementsToArray(document.querySelector('div.selected'));
    var url = location.href;
    var title = document.title;
    callback({content: content, url: url, title: title});
  }

  function main() {
    g_textCountFlag = false;

    // show icon in address bar
    chrome.runtime.sendMessage({type: 'showIcon'}, function() {});

    $(document).ready(function(){
      injectCSS();
      replaceSideBar();
      addTextCounter();
    });

    chrome.extension.onMessage.addListener(function(msg, sender, callback) {
      switch (msg.request) {
        case 'getTopic':
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
