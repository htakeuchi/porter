(function() {
  var nodes = null;
  var current_format = 'markdown';
  var current_mode = 'heading';

  // change export Mode
  function changeFormat(type) {
    var text;
 
    current_format = type;
    switch (type) {
      case "markdown":
        text = toMarkdown();
        break;
      case "html":
        text = toHtml();
        break;
    };  
    document.getElementById('textArea').innerText = text;
    textarea_select();
  };

  // switch convert mode (bullets, numbered, heading)
  function changeMode(mode) {
    current_mode = mode;
    changeFormat(current_format);
  };

  function hasChild(i) {
    return (i+1 < nodes.length) && (nodes[i+1].type != "eoc") && (nodes[i].type != "eoc");
  };

  function toMarkdown() {
    switch (current_mode) {
      case 'heading':
        return toHeading();
        break;
      case 'bulleted':
        return toBullets("*");
        break;
      case 'numbered':
        return toBullets("1.");
        break;
    }
  };

  function toHeading() {
    var text = "# " + nodes[0].title + "\n";  
    var previous = null;
    var level = 2;
    
    for (var i = 1; i < nodes.length; i++) {
      // Heading
      if (hasChild(i)) { 
        level = level + 1;
        text = text + new Array(level).join('#') + " " + nodes[i].title; 
      } else if (nodes[i].type == "eoc") {
        if (previous == "eoc") {
          level = level -1;
        }
        previous = nodes[i].type;
        continue;
      } else {
        text = text.concat(nodes[i].title + "\n");    
      };
      text = text.concat("\n");
      previous = nodes[i].type;
    }
    return text;
  }

  function toBullets(type) {
    var text = nodes[0].title + "\n";  
    var previous = null;
    var level = 1;
    
    for (var i = 1; i < nodes.length; i++) {
      if (nodes[i].type == "node") {
        if (previous == "node") {
          level = level + 1;
        };
        text = text + new Array(level).join('\t') + type + " " + nodes[i].title + "\n";       
      } else {
        if (previous != "node") {
          level = level - 1;
        };
      };
      previous = nodes[i].type;
    }
    return text;
  };

  function toHtml()
  {
    var renderer = new marked.Renderer();
    renderer.heading = function (text, level, raw) {
      return '<h'
        + level
        + '>'
        + text
        + '</h'
        + level
        + '>\n';
    };
    return marked(toMarkdown(), { renderer: renderer });
  };

  function textarea_select() {
    var t = document.getElementById('textArea');
    t.focus();
    t.select();
    document.execCommand("copy");
  };

  function main() {
    var port = chrome.extension.connect({ name: "Background" });
    port.onMessage.addListener(function(content) {
      nodes = content.content;
      changeFormat('markdown');
    });
    port.postMessage({action: "getContents"});
 
    document.getElementById("close").addEventListener("click",  function() { window.close(); }, false);

    document.getElementById("markDown").addEventListener("click",  function() { changeFormat('markdown'); }, false);
    document.getElementById("html").addEventListener("click",  function() { changeFormat('html'); }, false);

    document.getElementById("heading").addEventListener("click",  function() { changeMode('heading'); }, false);
    document.getElementById("bulleted").addEventListener("click",  function() { changeMode('bulleted'); }, false);
    document.getElementById("numbered").addEventListener("click",  function() { changeMode('numbered'); }, false);

    setTimeout(function() {textarea_select();}, 0);
  };
  
  window.onload = main;
}());