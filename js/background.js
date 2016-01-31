(function() {
  // show extension icon on address bar
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    chrome.pageAction.show(sender.tab.id);
    sendResponse({});
  });

  chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(request) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getContents"}, function(response) {
          port.postMessage({content: response.content});
        });  
      });
    });
  });
}());
