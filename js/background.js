(function() {
  var SEARCH_STRING = "https://workflowy.com/#/";

  // A generic onclick callback function.
  function genericOnClick(info, tab) {
console.log("item " + info.menuItemId + " was clicked");
console.log("info: " + JSON.stringify(info));
console.log("tab: " + JSON.stringify(tab));


    var request = info.menuItemId;
    var info = {"title": tab.title, "url": tab.url }

    if (request == "newWindow") {
//      var url = chrome.extension.getURL("popup.html");
      var url = "https://workflowy.com/#/e77b6eee8895";
      chrome.windows.create({"url": url, "type": "popup", "state": "docked"});
      return;
    } else if (request == "history") {
      var history = {};
      chrome.history.search({"text": "https://workflowy.com"},
        function(historyItem) {
          for (var i=0; i<historyItem.length; i++) {
console.log(historyItem[i]);
            if (typeof history[historyItem[i].url] === "undefined" ||
                history[historyItem[i].url].lastVisitTime < historyItem[i].lastVisitTime) {
              history[historyItem[i].url] = {};
              history[historyItem[i].url].title = historyItem[i].title;
              history[historyItem[i].url].visitCount = historyItem[i].visitCount;
              history[historyItem[i].url].lastVisitTime = historyItem[i].lastVisitTime;
            }
          }
          console.log("******************");
          console.log(history);
          info.history = history;
        }
      );
    }

    // send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {request: request, info: info}, function(response) {
console.log('callback background: ' + response);
      });
    });
  }

  function createContextMenu() {
    var parent = chrome.contextMenus.create(
      {"title": "Porter for WorkFlowy", "documentUrlPatterns": ["https://workflowy.com/*"], "contexts": ["all"]});
    var m0 = chrome.contextMenus.create(
      {"title": "Open this topic in new window", "id": "newWindow", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
    var m3 = chrome.contextMenus.create(
      {"title": "Show outline", "id": "outline", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
    var s1 = chrome.contextMenus.create(
      {"type": "separator", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
    var m1 = chrome.contextMenus.create(
      {"title": "Add this topic to bookmark", "id": "bookmark", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
  }

  createContextMenu();

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'showIcon') {
      // show extension icon on address bar
      chrome.pageAction.show(sender.tab.id);
    }
  });

  chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(request) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // send message to content script
        chrome.tabs.sendMessage(tabs[0].id, {request: 'gettopic'}, function(response) {
          // send message to popup
          port.postMessage(response);
        });
      });
    });
  });
}());
