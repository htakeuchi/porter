(function() {
  var g_nodes = null;
  var g_current_format = 'markdown';
  var g_output_notes = false;
  var g_title, g_url;

  var TABLE_REGEXP = /^\|/;
  var BQ_REGEXP = /^\>/;
  var LIST_REGEXP = /^((\*|\-|\+)\s|[0-9]+\.\s)/;

  // change option
  function changeOption(type) {
    g_output_notes = document.getElementById("outputNotes").checked;
    changeFormat(g_current_format);
  };

  // change export Mode
  function changeFormat(type) {
    var text;

    g_current_format = type;
    switch (type) {
      case "markdown":
        text = toMarkdown();
        break;
      case "html":
        text = toHtml();
        break;
    };
    document.getElementById('textArea').innerText = text;
    document.getElementById("popupTitle").innerHTML = makeTitleLabel(g_current_format, g_title, g_url);
    textarea_select();
  };

  function hasChild(pos) {
    if (g_nodes[pos].type != "node") return false;
    for (var i = pos + 1; i < g_nodes.length; i++) {
      if (g_nodes[i].type == "eoc") return false;
      if (g_nodes[i].type == "node") return true;
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
    var text = "# " + g_nodes[0].title + "\n";
    var previous = null;
    var prevElement = null;
    var level = 2;
    var list_level = 0;
    var eoc = false;

    for (var i = 1; i < g_nodes.length; i++) {
      var lineBreak = "";
      var indent = "";
      var element = "";

      if (g_nodes[i].type == "eoc") {
        eoc = true;

        if (previous == "eoc") {
          level = level - 1;
          list_level = list_level - 1;
        }
        previous = g_nodes[i].type;
        continue;
      } else if (g_nodes[i].type == "note") {
        if (g_output_notes) {
          text = text.concat("\n" + g_nodes[i].title + "\n\n");
          prevElement = "PARAGRAPH";
          continue;
        }
      } else {
        element = getElement(g_nodes[i].title);

        if (hasChild(i)) {
          level = level + 1;
          // HEADING
          if (element == "PARAGRAPH"){
            if (prevElement == "QUOTE" || prevElement == "LIST") indent = "\n";
            text =  text.concat(indent + new Array(level).join('#') + " " + g_nodes[i].title + "\n");
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
        if (g_nodes[i].title.substr(0, 3) == "```")
          lineBreak = "";
        else {
          if ((prevElement == "QUOTE" || prevElement == "LIST") && element != prevElement) {
            indent = "\n";
            lineBreak = "\n";
          }
          if (element == "PARAGRAPH") lineBreak = "\n";
        }
        text = text.concat(indent + g_nodes[i].title + "\n" + lineBreak);
      }
      prevElement = element;
      previous = g_nodes[i].type;
    }
    return text;
  }

  // noused
  function toBullets(type) {
    var text = g_nodes[0].title + "\n\n";
    var previous = null;
    var level = 1;

    for (var i = 1; i < g_nodes.length; i++) {
      if (g_nodes[i].type == "node") {
        if (previous == "node") {
          level = level + 1;
        };
        text = text + new Array(level).join('\t') + type + " " + g_nodes[i].title + "\n";
      } else if (g_nodes[i].type == "note" && g_output_notes) {
        text = text + g_nodes[i].title + "\n";
      } else {
        if (previous != "node") {
          level = level - 1;
        };
      };
      if (g_nodes[i].type != 'note') previous = g_nodes[i].type;
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
    document.getElementById("previewButton").addEventListener("click",  function() { preview(); }, false);
  }

  function makeTitleLabel(format, title, url) {
    return (format == "markdown") ? '[' + title + '](' + url + ')' : title + ' - ' + url;
  }

  function preview() {
    var img = '<img src="' + chrome.extension.getURL('image/space.gif') + '" width="800" height="1" alt="">';
    var html = '<div id="content">' + img + toHtml() + '</div>';
    //$('#contents').load(chrome.extension.getURL("css/theme/"+option.theme+".css");
    $('body').html(html);

    var link = document.createElement("link");
    link.href = chrome.extension.getURL("css/preview/porter.css");
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);
  }

  function main() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {request: 'getTopic'}, function(response) {
        g_nodes = response.content;
        g_title = response.title;
        g_url = response.url;
        changeFormat('markdown');
      });
    });
    setEventListers();
    textarea_select();
  }

  window.onload = main;
}());
