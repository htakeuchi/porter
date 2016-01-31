(function(global) {
  function elementToJson(node) { 
    var list = [];
    var e = node.querySelectorAll('div.project div.name div.content, div.children div.childrenEnd'); 
    list.push({title: e[0].textContent, type: 'title'});

    for (var i = 1; i < e.length; i++) {
      if (e[i].matches('div.content')) {
        list.push({title: e[i].textContent, type: 'node'});
      } else {
        list.push({title: '',  type: 'eoc'});        
      }
    }          
    return list;
  };
 
  chrome.extension.sendRequest({}, function(res) {});
  
  chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action == 'getContents') {
      var content = elementToJson(document.querySelector('div.selected'));
      sendResponse({content: content});
    }
  });
})();
