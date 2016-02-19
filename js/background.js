(function() {
  var SEARCH_STRING = "https://workflowy.com/#/";
  var REPLACE_STRING = / \- WorkFlowy$/;

  function toHtml(nodes) {
    var html = '';
    for (var i = 0; i < nodes.length; i++) {
      // folder and no children
      if (typeof nodes[i].url === "undefined" && nodes[i].children.length == 0) {
        continue;
      } else {
        html = html.concat(elementToHtml(nodes[i]));
      }
    }
    return html;
  }

  function elementToHtml(node) {
    var html = '';

    if (typeof node.url === "undefined" && node.children.length == 0) return html;

    if (node.children.length > 0) {
      html = html.concat('<ul><li class="closed"><span class="folder">'+ node.title + '</span><ul>');
      for (var j=0; j < node.children.length; j++) {
        html = html.concat(elementToHtml(node.children[j]));
      }
      html = html.concat('</ul></ul></li>');
    } else {
      html = html.concat('<li><span class="file"><a href="'+ node.url + '">' + node.title + '</a></span></li>');
    }
    return html;
  }

  // A generic onclick callback function.
  function genericOnClick(info, tab) {
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));

    switch (info.menuItemId) {
      case "bookmark":
      case "history":
      case "outline":
        var request = info.menuItemId;
        var info = {"title": tab.title, "url": tab.url }
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {request: request, info: info}, function(response) {
console.log('callback background: ' + response);
          });
        });
        break;
      case "export":
        break;
      case "Options":
        break;
    }
  }

  function createContextMenu() {
    var parent = chrome.contextMenus.create(
      {"title": "Porter for WorkFlowy", "contexts": ["all"]});
    var m1 = chrome.contextMenus.create(
      {"title": "Add this page to bookmark", "id": "bookmark", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
    var m2 = chrome.contextMenus.create(
      {"title": "Show history", "id": "history", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
    var m3 = chrome.contextMenus.create(
      {"title": "Show outline", "id": "outline", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
    var m4 = chrome.contextMenus.create(
      {"title": "Export", "id": "export", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
    var m5 = chrome.contextMenus.create(
      {"type": "separator", "parentId": parent, "contexts": ["all"]});
    var m6 = chrome.contextMenus.create(
      {"title": "Options", "id": "option", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
  }

  createContextMenu();

  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.type == 'showIcon') {
      // show extension icon on address bar
      chrome.pageAction.show(sender.tab.id);
    } else {
/*
      chrome.bookmarks.getTree(
        function(bookmarkTreeNodes) {
          var bm = dumpTreeNodes(bookmarkTreeNodes, SEARCH_STRING);
          bm = adjustHtml(toHtml(bm));
          sendResponse({bookMarks: bm});
        }
      );
*/
    }
  });

  chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(request) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {request: 'gettopic'}, function(response) {
          port.postMessage(response);
        });
      });
    });
  });
}());
