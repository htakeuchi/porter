var exportLib = (function () {
  // private method
  var hasChild, getElement, toc;

  var TABLE_REGEXP = /^\s*\|/;
  var BQ_REGEXP = /^\>/;
  var LIST_REGEXP = /^((\*|\-|\+)\s|[0-9]+\.\s)/;

  hasChild = function(nodes, pos) {
    if (nodes[pos].type != "node") return false;
    for (var i = pos + 1; i < nodes.length; i++) {
      if (nodes[i].type == "eoc") return false;
      if (nodes[i].type == "node") return true;
    };
    return false;
  };

  getElement = function(line) {
    var e;
    if (line.match(TABLE_REGEXP)) e = "TABLE";
      else if (line.match(BQ_REGEXP)) e = "QUOTE";
      else if (line.match(LIST_REGEXP)) e = "LIST";
      else e = "PARAGRAPH";
    return e;
  };

  // <h2><a name="memo" class="anchor" href="#memo"><span class="header-link"></span></a>MEMO</h2>
  toc = function(html) {
    var tocString = '';
    var headings = html.match(/<h[2-5].+?<\/h[2-5]/g);
    if (!headings || headings.length == 0) return tocString;
// <h2 id="-https-workflowy-com-547e9e06dc3c-"><a href="https://workflowy.com/#/547e9e06dc3c">はじめに</a></h2>

    for (var i=0; i<headings.length; i++) {
      var level = headings[i].match(/<h(\d)/)[1] - 1;
      var href = headings[i].match(/id="([^"]+?)"/)[1];
      var title = headings[i].match(/>([^<]+?)<\/a/)[1];
      title = (!title || title.length == 0) ? "Heading(Empty)" : title;
      tocString = tocString + new Array(level).join('\t') + '1. <a href="#' + href + '">' + title + '</a>\n';
    }
//    tocString = tocString.concat('\n</div>\n');

    return '<div class="toc">' + marked(tocString) + '</div>';
  };

  return {
    // public method
    toMarkdown: function(nodes, output_notes, outputHeadingLink) {
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

          if (hasChild(nodes, i)) {
            level = level + 1;
            // HEADING
            if (element == "PARAGRAPH"){
              if (prevElement == "QUOTE" || prevElement == "LIST") indent = "\n";
              var title = outputHeadingLink ? '[' + nodes[i].title + '](' + nodes[i].url + ')' : nodes[i].title;
              var line = indent + new Array(level).join('#') + " " + title + "\n";
              text =  text.concat(line);
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
    },

    toHtml: function(nodes, output_notes, output_toc, outputHeadingLink) {
      var renderer = new marked.Renderer();

/*
      renderer.heading = function (text, level) {
    //      var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        var escapedText = text.toLowerCase().replace(/¥s/g, '-');
        return '<h' + level + '><a name="' +
                      escapedText +
                       '" class="anchor" href="#' +
                       escapedText +
                       '"><span class="header-link"></span></a>' +
                        text + '</h' + level + '>\n';
      };

*/      var html = marked(this.toMarkdown(nodes, output_notes, outputHeadingLink), { renderer: renderer });
      return output_toc ? toc(html) + html : html;
    },

    toPreviewHTML: function(nodes) {
      return this.toHtml(nodes, false, true, true);
    }
  };
})();
