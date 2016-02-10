(function() {
  var SEARCH_STRING = "https://workflowy.com/#/";
  var REPLACE_STRING = / \- WorkFlowy$/;

  function adjustHtml(s) {
    s = s.replace(/\<\/span>/, 'Top</span>').replace(/^\<ul\>/, '<ul id="browser" class="filetree">');
    return s.replace(/ class="closed"/, '');
  }

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
  
  function dumpTreeNodes(bookmarkNodes, query) {
    var list = [];
    for (var i = 0; i < bookmarkNodes.length; i++) {
      if ((typeof bookmarkNodes[i].url === "undefined") || (bookmarkNodes[i].url.indexOf(query) >= 0)) {
        list.push(dumpNode(bookmarkNodes[i], query));
      }
    }
    return list;
  }
  function dumpNode(bookmarkNode, query) {
    var li = {url: bookmarkNode.url, title:  bookmarkNode.title, children: []};
    
    if ((typeof li.url !== "undefined") && (li.url.indexOf(query) >= 0)) {
      li.title = li.title.replace(REPLACE_STRING, '');
    }

    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
      li.children = dumpTreeNodes(bookmarkNode.children, query);
    }
    return li;
  }

  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.type == 'showIcon') {
      // show extension icon on address bar
      chrome.pageAction.show(sender.tab.id);
    } else {
      chrome.bookmarks.getTree(
        function(bookmarkTreeNodes) {
          var bm = dumpTreeNodes(bookmarkTreeNodes, SEARCH_STRING);
          bm = adjustHtml(toHtml(bm));
          sendResponse({bookMarks: bm});
        }
      );
    }
  });

  chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(request) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
          port.postMessage(response);
        });
      });
    });
  });
}());
