(function() {
  var g_editor;
  var g_current_theme;
  var g_theme_css;

  var themes = [
    {'label': 'Porter theme for WorkFlowy by \htakeuchi',
      'filename': 'porter'
    },
    {'label': 'Work a Simpler Flowy v2.0 by 72dpi',
      'filename': 'WorkaSimplerFlowyv2.0'
    },
    {'label': 'workflowy.com - clean and bright by hodanli',
      'filename': 'cleanandbright'
    },
    {'label': 'Workflowy for Writers by isaribi',
      'filename': 'workflowyforwriters'
    },
    {'label': 'Workflowy Monokai by F0rnit1',
      'filename': 'WorkflowyMonokai'
    },
    {'label': 'Workflowy Itemized by Dan Fessler',
      'filename': 'workflowy-itemized'
    },
    {'label': 'WorkFlowyGiffmex by giffmex',
      'filename': 'workflowygiffmex'
    },
    {'label': 'Big Black Workflowy by rsynnest',
      'filename': 'big-black-workflowy'
    },
    {'label': 'Custom CSS Only (unused built-in theme)',
      'filename': 'CUSTOM'
    },
  ];

  function save() {
    $('#alert').css('display','block');
    setTimeout(function() {$('#alert').fadeOut();}, 6000);

    chrome.storage.sync.set({
      'custom_css': g_editor.getValue(),
      'theme': g_current_theme,
      'theme_css': g_theme_css,
      'theme_enable': document.getElementById('themeEnable').checked,
      'bookmark_enable': document.getElementById('bookmarkEnable').checked,
      'bookmark_width': $("input[name='bookmakrWidth']:checked").val()
    });
  };

  function load() {
    chrome.storage.sync.get([
      "theme_enable", "theme", "theme_css", "custom_css",
      "bookmark_enable", "bookmark_width"
      ],
      function (option) {
        // Enable Theme
        document.getElementById('themeEnable').checked = option.theme_enable;
        if (option.theme_enable) {toggle_theme_enable();}

        // Theme
        g_current_theme = option.theme;
        setThemeList();
        change_theme();

        // Theme CSS
        g_theme_css = option.theme_css;

        // Aditional CSS
        g_editor.setValue(option.custom_css);

        // Enable Bookmark
        document.getElementById('bookmarkEnable').checked = option.bookmark_enable;
        var width = option.bookmark_width ? option.bookmark_width : "normalRadio";
        document.getElementById(width).checked = true;
      }
    );
  }

  function setThemeList()
  {
    var select = document.getElementById('themeSelect');

    for (var i=0; i<themes.length; i++) {
      var option = document.createElement('option');
      option.setAttribute('value', themes[i].filename);
      option.innerHTML = themes[i].label;
      if (g_current_theme == themes[i].filename) {option.selected = true;}
      select.appendChild(option);
    }
  }

  function toggle_theme_enable() {
    change_theme();
  }

  function change_theme() {
    var select = document.getElementById('themeSelect');
    g_current_theme = select.value;
  }

  function main() {

    document.getElementById("apply").addEventListener("click",  function() { save(); }, false);
    document.getElementById("themeEnable").addEventListener("click",  function() { toggle_theme_enable(); }, false);
    document.getElementById("themeSelect").addEventListener("change",  function() { change_theme(); }, false);

    var textArea = document.getElementById("textArea");
    g_editor = CodeMirror.fromTextArea(textArea, {
      mode: "css",
      value: "",
      lineNumbers: true,
      extraKeys: {"Ctrl-Space": "autocomplete"},
      tabSize: 2
    });

    load();
  };

  main();
}());
