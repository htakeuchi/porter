(function() {
  var nodes = null;
  var current_format = 'markdown';
  var current_mode = 'heading';
  var output_notes = false;

  var TABLE_REGEXP = /^\|/;
  var BQ_REGEXP = /^\>\s/;
  var LIST_REGEXP = /^(\*\s|[0-9]+\.\s)/;

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

  // switch convert mode (bullets, numbered, heading)
  function changeMode(mode) {
    current_mode = mode;
    changeFormat(current_format);
  };

  function hasChild(pos) {
    if (nodes[pos].type != "node") return false;
    for (var i = pos + 1; i < nodes.length; i++) {
      if (nodes[i].type == "eoc") return false;
      if (nodes[i].type == "node") return true;
    };
    return false;
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

  function getLineInfo(line, level) {
    var v = {lineBreak: "", indent: "", mode: ""};
    if (line.match(TABLE_REGEXP)) v.mode = "TABLE";
    else if (line.match(BQ_REGEXP)) v.mode = "QUOTE";
    else if (line.match(LIST_REGEXP)) {
      v.indent = new Array(level-3).join("\t");
      v.mode = "LIST";
    } else {
      v.lineBreak = "\n";
      v.mode = "PARAGRAPH";
    }
    return v;
  }

  function toHeading() {
    var text = "# " + nodes[0].title + "\n";
    var previous = null;
    var prev_mode = null;
    var level = 2;

    for (var i = 1; i < nodes.length; i++) {
      var lineBreak = "";
      var headBreak = "";
      var indent = "";

      if (nodes[i].type == "eoc") {
        if (previous == "eoc") level = level -1;
        previous = nodes[i].type;
        continue;
      } else if (nodes[i].type == "note") {
        if (output_notes) {
          text = text.concat("\n" + nodes[i].title + "\n");
          prev_mode = "PARAGRAPH";
          continue;
        }
      } else {
        var v = getLineInfo(nodes[i].title, level);

        if (hasChild(i)) {
          level = level + 1;
          // HEADING
          if (v.mode == "PARAGRAPH"){
            text =  text.concat(new Array(level).join('#') + " " + nodes[i].title + "\n");
            prev_mode = "HEADING";
            continue;
          }
        }

        if (nodes[i].title.substr(0, 3) == "```") lineBreak = "";
        else {
          if ((prev_mode == "QUOTE" || prev_mode == "LIST") && v.mode != prev_mode) { console.log("YEAH!"); headBreak = "\n";}
          lineBreak = v.lineBreak;
          indent = v.indent;
        }
        text = text.concat(headBreak + indent + nodes[i].title + "\n" + lineBreak);
      }
      prev_mode = v.mode;
      previous = nodes[i].type;
    }
    return text;
  }

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
    document.execCommand("copy");
  };

  function setEventListers(){
    document.getElementById("close").addEventListener("click",  function() { window.close(); }, false);
    document.getElementById("markDown").addEventListener("click",  function() { changeFormat('markdown'); }, false);
    document.getElementById("html").addEventListener("click",  function() { changeFormat('html'); }, false);
    document.getElementById("heading").addEventListener("click",  function() { changeMode('heading'); }, false);
    document.getElementById("bulleted").addEventListener("click",  function() { changeMode('bulleted'); }, false);
    document.getElementById("numbered").addEventListener("click",  function() { changeMode('numbered'); }, false);
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
    setTimeout(function() {textarea_select();}, 0);
  };

  window.onload = main;
}());
