(function() {
  var nodes = null;
  var current_format = 'markdown';
  var output_notes = false;

  var TABLE_REGEXP = /^\|/;
  var BQ_REGEXP = /^\>/;
  var LIST_REGEXP = /^((\*|\-|\+)\s|[0-9]+\.\s)/;

  // change option
  function changeOption(type) {
    output_notes = document.getElementById("outputNotes").checked;
    changeFormat(current_format);
  };

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

  function hasChild(pos) {
    if (nodes[pos].type != "node") return false;
    for (var i = pos + 1; i < nodes.length; i++) {
      if (nodes[i].type == "eoc") return false;
      if (nodes[i].type == "node") return true;
    };
    return false;
  };

  function getElement(line) {
    var e;
    if (line.match(TABLE_REGEXP)) e = "TABLE";
      else if (line.match(BQ_REGEXP)) e = "QUOTE";
      else if (line.match(LIST_REGEXP)) e = "LIST";
      else e = "PARAGRAPH";
    return e;
  }

  // TODO: teribble... refactoring
  function toMarkdown() {
    var text = "# " + nodes[0].title + "\n";
    var previous = null;
    var prevElement = null;
    var level = 2;
    var list_level = 0;
    var eoc = false;

    for (var i = 1; i < nodes.length; i++) {
      var lineBreak = "";
      var indent = "";
      var element = "";

      if (nodes[i].type == "eoc") {
        eoc = true;

        if (previous == "eoc") {
          level = level - 1;
          list_level = list_level - 1;
        }
        previous = nodes[i].type;
        continue;
      } else if (nodes[i].type == "note") {
        if (output_notes) {
          text = text.concat("\n" + nodes[i].title + "\n\n");
          prevElement = "PARAGRAPH";
          continue;
        }
      } else {
        element = getElement(nodes[i].title);

        if (hasChild(i)) {
          level = level + 1;
          // HEADING
          if (element == "PARAGRAPH"){
            if (prevElement == "QUOTE" || prevElement == "LIST") indent = "\n";
            text =  text.concat(indent + new Array(level).join('#') + " " + nodes[i].title + "\n");
            prevElement = "HEADING";
            continue;
          }
        }

        if (element == "LIST") {
          if (prevElement != "LIST") {
            eoc = false;
            list_level = 1;
          } else {
            if (!eoc) {
              list_level = list_level + 1;
            } else {
              eoc = false;
            }
          }
          indent = new Array(list_level).join("\t");
        }
        if (nodes[i].title.substr(0, 3) == "```")
          lineBreak = "";
        else {
          if ((prevElement == "QUOTE" || prevElement == "LIST") && element != prevElement) {
            indent = "\n";
            lineBreak = "\n";
          }
          if (element == "PARAGRAPH") lineBreak = "\n";
        }
        text = text.concat(indent + nodes[i].title + "\n" + lineBreak);
      }
      prevElement = element;
      previous = nodes[i].type;
    }
    return text;
  }

  // noused
  function toBullets(type) {
    var text = nodes[0].title + "\n\n";
    var previous = null;
    var level = 1;

    for (var i = 1; i < nodes.length; i++) {
      if (nodes[i].type == "node") {
        if (previous == "node") {
          level = level + 1;
        };
        text = text + new Array(level).join('\t') + type + " " + nodes[i].title + "\n";
      } else if (nodes[i].type == "note" && output_notes) {
        text = text + nodes[i].title + "\n";
      } else {
        if (previous != "node") {
          level = level - 1;
        };
      };
      if (nodes[i].type != 'note') previous = nodes[i].type;
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
    setTimeout(function() { document.execCommand("copy") }, 200);
  };

  function setEventListers(){
    document.getElementById("close").addEventListener("click",  function() { window.close(); }, false);
    document.getElementById("markDown").addEventListener("click",  function() { changeFormat('markdown'); }, false);
    document.getElementById("html").addEventListener("click",  function() { changeFormat('html'); }, false);
    document.getElementById("outputNotes").addEventListener("click",  function() { changeOption('notes'); }, false);
  }

  function makeTitleLabel(title, url) {
    return '[' + title + '](' + url + ')';
  }

  function main() {
    var port = chrome.extension.connect({ name: "Background" });
    port.onMessage.addListener(function(response) {
      nodes = response.content;
      document.getElementById("popupTitle").innerHTML = makeTitleLabel(response.title, response.url);
      changeFormat('markdown');
    });

    port.postMessage();
    setEventListers();
    textarea_select();
  };

  window.onload = main;
}());
