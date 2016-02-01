(function(global) {
  function elementToJson(node) { 
    var list = [];
    var e = node.querySelectorAll('div.project div.name, div.project div.notes, div.children div.childrenEnd'); 
    // title in first line
    list.push({title: e[0].textContent, type: 'title'});
    // notes in first line
    var text = e[1].getElementsByClassName("content")[0];
    if (text.textContent.length > 1) {
      list.push({title: text.textContent.replace(/\n+$/g,''), type: 'note'});
    };
          
    for (var i = 2; i < e.length; i++) {
      if (e[i].matches('div.childrenEnd')) {
        list.push({title: '',  type: 'eoc'});        
      } else {
        text = e[i].getElementsByClassName("content")[0];
        if (e[i].className.match('notes') && text.textContent.length > 1) {
          list.push({title: text.textContent.replace(/\n+$/g,''), type: 'note'});
        } else if (e[i].className.match('name')) {
          list.push({title: text.textContent, type: 'node'});
        };
      };
    };          
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
