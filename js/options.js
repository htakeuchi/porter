(function() {
  var editor;
  
  function save() {    
    // Custom CSS
    chrome.storage.sync.set({'css': editor.getValue()});    
  };
  
  function load() {
    chrome.storage.sync.get("css", function(css) {
      if (!chrome.runtime.error) {
        console.log(css);
        editor.setValue(css.css);
      }
    });
  };

  function main() {
    document.getElementById("save").addEventListener("click",  function() { save(); }, false);
    
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
