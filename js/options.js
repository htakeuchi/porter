(function() {
  function save() {    
    // Custom CSS
    chrome.storage.sync.set({'css': document.getElementById('textArea').value});    
  };
  
  function load() {
    chrome.storage.sync.get("css", function(css) {
      if (!chrome.runtime.error) {
        console.log(css);
        document.getElementById("textArea").value = css.css;
      }
    });
  };

  function main() {
    load();
    document.getElementById("save").addEventListener("click",  function() { save(); }, false);
  };

  main();
}());
