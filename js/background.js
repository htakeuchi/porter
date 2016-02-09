(function() {
  var SEARCH_STRING = "https://workflowy.com/#/";
  
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

  function dumpTreeNodes(bookmarkNodes, query) {
    var list = '<ul>';
    var i;
    for (i = 0; i < bookmarkNodes.length; i++) {
      list = list.concat(dumpNode(bookmarkNodes[i], query));
    }
    return list.concat('</ul>');
  }
  function dumpNode(bookmarkNode, query) {
    var li = '';
    if (typeof bookmarkNode.url === "undefined") {
      li = '<li class="closed"><span class="folder">' + bookmarkNode.title + '</span>';
    } else { 
      if (bookmarkNode.url.indexOf(query) >= 0) 
        li = '<li><span class="file"><a href="' + bookmarkNode.url + '">' + bookmarkNode.title + '</a></span></li>';
    }

    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
      li = li.concat(dumpTreeNodes(bookmarkNode.children, query));
      li = li.concat('</li>');
    }
    return li;
  }

  function adjustHtml(s) {
    s = s.replace(/(^\<ul\>\<li class="closed"\>\<span class="folder"\>\<\/span\>)|(\<\/ul\>$)/g, '');
    return s.replace(/^\<ul\>/, '<ul id="browser" class="filetree">');
  }

  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.type == 'showIcon') {
      // show extension icon on address bar
      chrome.pageAction.show(sender.tab.id);
    } else {
      var bookmarkTreeNodes = chrome.bookmarks.getTree(
        function(bookmarkTreeNodes) {
          var bookMark = dumpTreeNodes(bookmarkTreeNodes, SEARCH_STRING);
          var contents = Object();
          contents.bookMarks = adjustHtml(bookMark);
          sendResponse(contents);
        });  
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

