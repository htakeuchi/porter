(function(global) {
  function elementsToArray(node) {
    var list = [];
    var e = node.querySelectorAll('div.project div.name, div.project div.notes, div.children div.childrenEnd');
    // title in first line
    list.push({title: e[0].textContent, type: 'title'});
    // notes in first line
    var text = e[1].getElementsByClassName("content")[0];
    if (text.textContent.length > 1) {
      list.push({title: text.textContent.replace(/\n+$/g,''), type: 'note'});
    }

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
  }

  function setCSS(css) {
    if (document.head) {
      var style = document.createElement("style");
      style.innerHTML = css;
      document.head.appendChild(style);
    }
  }

// TODO: 一括してロードする
  function injectCSS() {
    chrome.storage.sync.get("theme_enable", function(storage) {
      if (storage.theme_enable) {
        chrome.storage.sync.get("theme", function(storage) {
          if (storage.theme == "CUSTOM") {
            chrome.storage.sync.get("custom_css", function(storage) {
              setCSS(storage.custom_css);
            });
          } else {
            chrome.storage.sync.get("theme", function(storage) {
              var link = document.createElement("link");
              link.href = chrome.extension.getURL("css/theme/"+storage.theme+".css");
              link.type = "text/css";
              link.rel = "stylesheet";
              document.getElementsByTagName("head")[0].appendChild(link);
            });
          };
        });
      }
    });
  }

  function main() {
    // show icon in address bar
    chrome.extension.sendRequest({}, function(res) {});

    // inject custom CSS Listener
    window.onload = injectCSS;

    chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
      var content = elementsToArray(document.querySelector('div.selected'));
      var url = location.href;
      var title = document.title;
      sendResponse({content: content, url: url, title: title});
    });
  }

  main();

})();
