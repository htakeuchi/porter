(function() {
  var SEARCH_STRING = "https://workflowy.com/#/";

  // A generic onclick callback function.
  function genericOnClick(info, tab) {
console.log("item " + info.menuItemId + " was clicked");
console.log("info: " + JSON.stringify(info));
console.log("tab: " + JSON.stringify(tab));

    var request = info.menuItemId;

    if (request == 'history') {
console.log('history');
console.log(      chrome.extension.getViews({"type": "popup"}));
    } else {
      var info = {"title": tab.title, "url": tab.url }
      // send message to content script
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {request: request, info: info}, function(response) {
console.log('callback background: ' + response);
        });
      });
    }
  }

  function createContextMenu() {
    var parent = chrome.contextMenus.create(
      {"title": "Porter for WorkFlowy", "documentUrlPatterns": ["https://workflowy.com/*"], "contexts": ["all"]});
    var m1 = chrome.contextMenus.create(
      {"title": "Add this page to bookmark", "id": "bookmark", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
    var m2 = chrome.contextMenus.create(
      {"title": "Show history", "id": "history", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
    var m3 = chrome.contextMenus.create(
      {"title": "Show outline", "id": "outline", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
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
