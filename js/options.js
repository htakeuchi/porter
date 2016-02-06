(function() {
  var editor;
  var current_theme;
  var theme_css;

  var themes = [
    {'label': 'Porter theme for WorkFlowy by @htakeuchi',
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
    setTimeout(function() {$('#alert').fadeOut();}, 3000);

    chrome.storage.sync.set({
      'custom_css': editor.getValue(),
      'theme': current_theme,
      'theme_css': theme_css,
      'theme_enable': document.getElementById('themeEnable').checked,
    });
  };

  function load() {
    chrome.storage.sync.get("theme_enable", function(storage) {
      document.getElementById('themeEnable').checked = storage.theme_enable;
      if (storage.theme_enable) {toggle_theme_enable();}
    });

    chrome.storage.sync.get("theme", function(storage) {
      current_theme = storage.theme;
      setThemeList();
      change_theme();
    });

    chrome.storage.sync.get("theme_css", function(storage) {
      theme_css = storage.theme_css;
    });

    chrome.storage.sync.get("custom_css", function(storage) {
      editor.setValue(storage.custom_css);
    });
  };

  function setThemeList()
  {
    var select = document.getElementById('themeSelect');

    for (var i=0; i<themes.length; i++) {
      var option = document.createElement('option');
      option.setAttribute('value', themes[i].filename);
      option.innerHTML = themes[i].label;
      if (current_theme == themes[i].filename) {option.selected = true;}
      select.appendChild(option);
    }
  }

  function toggle_theme_enable() {
    change_theme();
  }

  function change_theme() {
    var select = document.getElementById('themeSelect');
    current_theme = select.value;
  }

  function main() {
    document.getElementById("save").addEventListener("click",  function() { save(); }, false);
    document.getElementById("themeEnable").addEventListener("click",  function() { toggle_theme_enable(); }, false);
    document.getElementById("themeSelect").addEventListener("change",  function() { change_theme(); }, false);

    var textArea = document.getElementById("textArea");
    editor = CodeMirror.fromTextArea(textArea, {
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
