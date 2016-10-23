function getInjectedScript() {
  // inject code into "the other side" to talk back to this side;
  var scr = document.createElement('script');
  //appending text to a function to convert it's src to string only works in Chrome
  scr.textContent = '(' + function () {
    let result = {logs: []};
    if (PerfLog && PerfLog.GetLogStatistics) {
      let logs = PerfLog.GetLogStatistics();
	    result.logs = logs
    }
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("StatisticsEvent", true, true, result);
    window.dispatchEvent(event); } + ')();';
  return scr;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  let scr = getInjectedScript();
  let listener = function (e) {
    sendResponse(e.detail);
	  window.removeEventListener("StatisticsEvent", listener);
  };
  window.addEventListener("StatisticsEvent", listener);
  //cram that sucker in 
  (document.head || document.documentElement).appendChild(scr);
  //and then hide the evidence as much as possible.
  scr.parentNode.removeChild(scr);
  //now listen for the message
});

