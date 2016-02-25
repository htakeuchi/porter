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

//<h2 id="-https-workflowy-com-e006e364de95-"><a href="https://workflowy.com/#/e006e364de95">機能</a></h2>
  toc = function(html) {
    var tocString = '';
    var headings = html.match(/<h[2-5].+?<\/h[2-5]/g);
    if (!headings || headings.length == 0) return tocString;

    for (var i=0; i<headings.length; i++) {
      var level = headings[i].match(/<h(\d)/)[1] - 1;
      var href = headings[i].match(/id="([^"]+?)"/)[1];
//      var title = headings[i].match(/>([^<]+?)<\//)[1];
      var title = headings[i].match(/href="[^"]+">([^<]+?)<\/a/)[1];
      title = (!title || title.length == 0) ? "Heading(Empty)" : title;
      tocString = tocString + new Array(level).join('\t') + '1. <a href="#' + href + '">' + exportLib.escape(title) + '</a>\n';
    }
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

    getRenderer: function(escape) {
      var renderer = new marked.Renderer();
      renderer.heading = function(text, level) {
        return '<h'
          + level
          + ' id="'
//          + raw.toLowerCase().replace(/[^\w]+/g, '-')
          + escape ? exportLib.escapeHtml(text) :text
          + '">'
          + escape ? exportLib.escapeHtml(text) : text
          + '</h'
          + level
          + '>\n';
      };
      return renderer;
    },

    escapeHtml: function(content) {
      var TABLE_FOR_ESCAPE_HTML = {
        "&": "&amp;",
        "\"": "&quot;",
        "<": "&lt;",
        ">": "&gt;"
      };
      return content.replace(/[&"<>]/g, function(match) {
        return TABLE_FOR_ESCAPE_HTML[match];
      });
    },

    toHtml: function(nodes, output_notes, output_toc, outputHeadingLink) {
      var renderer = this.getRenderer();
console.log('toHtml');
      var md = this.toMarkdown(nodes, output_notes, outputHeadingLink);
console.log(md);
//      var html = marked(md,{ renderer: renderer });
      var html = marked(md);
console.log(html);
      return output_toc ? toc(html) + html : html;
    },

    toPreviewHTML: function(nodes) {
      return this.toHtml(nodes, false, true, true);
    }
  };
})();
