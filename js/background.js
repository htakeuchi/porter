(function() {
  var SEARCH_STRING = "https://workflowy.com/";

  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.type == 'showIcon') {
      // show extension icon on address bar
      chrome.pageAction.show(sender.tab.id);
    } else {
      chrome.bookmarks.search(SEARCH_STRING, function(bookMark) {        
        var contents = Object();
        contents.bookMarks = bookMark;
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




