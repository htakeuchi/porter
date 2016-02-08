(function() {
  var SEARCH_STRING = "https://workflowy.com/";

  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    // show extension icon on address bar
    chrome.pageAction.show(sender.tab.id);

    chrome.bookmarks.search(SEARCH_STRING, function(bookMark) {
      var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
      var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
      chrome.history.search({
          'text': SEARCH_STRING,
          'maxResults': 100,
          'startTime': oneWeekAgo
        },
        function(history) {
          var contents = Object();
          contents.bookMarks = bookMark;
          contents.history = history;
          sendResponse(contents);
        }
      );
    });
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




