(function(global) {
  var g_timerID;
  var g_textCountFlag;
  var g_CounterMsg = chrome.i18n.getMessage('Clicktocount');

  function elementsToArray(node) {
    var list = [];
    var e = node.querySelectorAll('div.project div.name, div.project div.notes, div.children div.childrenEnd');
    // <div class="name ">
    //   <a class="bullet" href="/#/18a6fdffe459"></a>
    //   <div class="content" contenteditable="">TITLE</div>
    //   <span class="parentArrow"></span>
    // </div>
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
          list.push({title: text.textContent, type: 'node', url: e[i].querySelector('a').href});
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
    var tree = $('#bookmark');
    return {"tree": tree, "node": tree.tree('getNodeById', 1)};
  }

  function addBookmark(url, title) {
    if (typeof url === "undefined") url = location.href;
    if (typeof title === "undefined") title = document.title;
    var info = getRootNode();
    title = title.replace(/\s\-\sWorkFlowy$/, '');
    info.tree.tree('appendNode', { label: title, url: url }, info.node);
    saveBookmark();
  }

  function addBookmarkFolder() {
    var info = getRootNode();
    var title = window.prompt(chrome.i18n.getMessage('Inputfoldername'), "");
    if (typeof title === "undefined" || title == null || title.length == 0) return;

    info.tree.tree('appendNode', { label: title }, info.node);
    saveBookmark();
  }

  function saveBookmark() {
    setTimeout(function() {
      var tree = $('#bookmark');
      chrome.storage.sync.set({
        'bookmarks': tree.tree('toJson')
      });
    }, 1000);
  }

  function getSelectedNode() {
    var tree = $('#bookmark');
    return tree.tree('getSelectedNode');
  }

  function deleteBookmark() {
    var node = getSelectedNode();
    if (!node) return;
    if (window.confirm(chrome.i18n.getMessage('ConfirmDelete'))) {
      $('#bookmark').tree('removeNode', node);
      saveBookmark();
    }
  }

  function editBookmark() {
    var node = getSelectedNode();
    if (!node) return;
    var title = window.prompt(chrome.i18n.getMessage('Edittitle'), node.name);
    if (typeof title === "undefined" || title == null || title.length == 0) return;

    var tree = $('#bookmark');
    tree.tree('updateNode', node, title);
    saveBookmark();
  }

  function buildBookmarkTree(bookmarks) {
    // Build Tree
    var bookmarkArea = $('#navigationBar #bookmark');
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

  function getBookmarkMenu() {
    return '<span id="addBookmark" class="naviMenuItem" title="Add bookmark"></span>\
            <span id="addFolderLink" class="naviMenuItem" title="Add floder"></span>\
            <span id="editLink" class="naviMenuItem" title="Edit title"></span>\
            <span id="deleteLink" class="naviMenuItem" title="Remove bookmark"></span>';
  }

  function setupBookmarkArea()
  {
    var bookmarks = [];
    chrome.storage.sync.get(["bookmark_enable", "bookmarks", "bookmark_width"], function (option) {
      if (option.bookmark_enable) {
        // TODO: delete bookmark width option
        if (!option.bookmarks) {
        } else {
          bookmarks = JSON.parse(option.bookmarks);
        }
        $('#bookmarkMenu').html(getBookmarkMenu());
        buildBookmarkTree(bookmarks);

        $('#addBookmark').click(function() {addBookmark(); return false});
        $('#addFolderLink').click(function() {addBookmarkFolder(); return false});
        $('#editLink').click(function() {editBookmark(); return false});
        $('#deleteLink').click(function() {deleteBookmark(); return false});
      }
    });
  }
  // #### [その他確認・共有事項](https://workflowy.com/#/b5f2cdbf30e9)
  function setupTopicNavi() {
    $('#navigationBar').hover(function () {
      var content = elementsToArray(document.querySelector('div.selected'));
      var md = exportLib.toMarkdown(content, false, true);
      var headings = md.match(/^#.+?\n/mg);
      if (!headings || headings.length == 0) return;

      var naviMd = '';
      for (var i=0; i<headings.length; i++) {
        var level = headings[i].match(/^(#+)\s/)[0].length - 2;
        if (level <= 0 || level > 3) continue;
        naviMd = naviMd + headings[i].replace(/^#+/, new Array(level).join('\t') + '*');
      }

      var html = marked(naviMd);
      $('#navigationBar #topicNavi').html(html);
    },
    function() {});
  }

  function getContent(callback) {
    var content = elementsToArray(document.querySelector('div.selected'));
    var url = location.href;
    var title = document.title;
    callback({content: content, url: url, title: title});
  }

  function createNavigationBar() {
    var navigationBar = '\
  　 <div id="navigationBar">\
       <div class="menuHeader">Topic Navigation</div>\
       <div id="topicNavi"></div>\
       <div class="menuHeader">' + chrome.i18n.getMessage('Bookmark') +  '<span id="bookmarkMenu"></span></div>\
       <div id="bookmark"></div>\
     </div>';
    $('body').append(navigationBar);
    setupBookmarkArea();
    setupTopicNavi();
  }

  function main() {
    g_textCountFlag = false;

    // show icon in address bar
    chrome.runtime.sendMessage({type: 'showIcon'}, function() {});

    $(document).ready(function(){
      injectCSS();
      createNavigationBar();
      addTextCounter();
    });

    chrome.extension.onMessage.addListener(function(msg, sender, callback) {
      switch (msg.request) {
        case 'preview':
          var nodes = elementsToArray(document.querySelector('div.selected'));
          callback({html: exportLib.toPreviewHTML(nodes), title: document.title});
          break;
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
