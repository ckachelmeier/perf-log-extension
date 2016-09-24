function getInjectedScript() {
  // inject code into "the other side" to talk back to this side;
  var scr = document.createElement('script');
  //appending text to a function to convert it's src to string only works in Chrome
  scr.textContent = '(' + function () { 
    let result = {logs: []};
    if (PerfLog && PerfLog.GetLogManager) {
	  console.log("hello world2");
      let logs = PerfLog.GetLogManager().getFlatLogs()
	  console.log(result);
	  result.logs = logs
    }
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("MyCustomEvent", true, true, result);
    window.dispatchEvent(event); } + ')();';
  return scr;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  let scr = getInjectedScript();
  let listener = function (e) {
	console.log("sending response: ");
	console.log(e.detail);
    sendResponse(e.detail);
	window.removeEventListener("MyCustomEvent", listener);
  };
  window.addEventListener("MyCustomEvent", listener);
  //cram that sucker in 
  (document.head || document.documentElement).appendChild(scr);
  //and then hide the evidence as much as possible.
  scr.parentNode.removeChild(scr);
  //now listen for the message
});

console.log("hello world1");
