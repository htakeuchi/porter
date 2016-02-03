(function() {
  var editor;
  var current_theme;
  var theme_css;

  var themes = [
    {'label': 'Work a Simpler Flowy v2.0', 
      'author': '', 
      'url': 'https://userstyles.org/styles/123191/work-a-simpler-flowy-v2-0',
      'filename': 'WorkaSimplerFlowyv2.0'
    },
    {'label': 'workflowy.com - clean and bright',
     'author': '',
     'url': 'https://userstyles.org/styles/103816/workflowy-com-clean-and-bright',
      'filename': 'cleanandbright'
    },
    {'label': 'matFlow.dark - Emerald [WorkFlowy]', 
      'author': '', 
      'url': 'https://userstyles.org/styles/119273/matflow-dark-emerald-workflowy',
      'filename': 'matFlow.darkEmerald'
    },
    {'label': 'Workflowy for Writers', 
      'author': '', 
      'url': 'https://userstyles.org/styles/111747/workflowy-for-writers',
      'filename': 'workflowyforwriters'
    },     
    {'label': 'Workflowy Monokai',
     'author': '', 
     'url': 'https://userstyles.org/styles/108530/workflowy-monokai',
      'filename': 'WorkflowyMonokai'
    },
    {'label': 'CUSTOM',
     'author': 'YOU', 
     'url': 'https://workflowy.com',
      'filename': 'CUSTOM'
    }, 
  ];
  
  function save() {    
    // Custom CSS
    chrome.storage.sync.set({
      'custom_css': editor.getValue(),
      'theme': current_theme,
      'theme_css': theme_css,
      'theme_enable': document.getElementById('themeEnable').checked,
    });    
  };
  
  // TODO: 一括してロードする
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
    var select = document.getElementById('themeSelect');
    select.disabled = !select.disabled;
    change_theme();
  }
  
  function change_theme() {
    var select = document.getElementById('themeSelect');
    var e = document.getElementById('editorArea');
    current_theme = select.value;
 
    if (select.value == "CUSTOM" && document.getElementById('themeEnable').checked) {
      e.style.display = 'block';
      editor.refresh();
    } else {
      theme_css = 
      e.style.display = 'none';
    }  
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
