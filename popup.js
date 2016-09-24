const SF = 4;
function refresh() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, "refresh", populateLogs);
    });
}

function populateLogs(response) {
    let template = document.getElementById("row-template").innerHTML;
    if (response && response.logs) {
        for (let log of response.logs) {
            log.successMin = getRoundedValue(log.successMin, SF)
            log.successAverage = getRoundedValue(log.successAverage, SF)
            log.successMax = getRoundedValue(log.successMax, SF)
            log.successStandardDeviation = getRoundedValue(log.successStandardDeviation, SF)
            log.failureMin = getRoundedValue(log.failureMin, SF)
            log.failureAverage = getRoundedValue(log.failureAverage, SF)
            log.failureMax = getRoundedValue(log.failureMax, SF)
            log.failureStandardDeviation = getRoundedValue(log.failureStandardDeviation, SF)
        }
        let output = Mustache.render(template, response);
        document.getElementById("logs").innerHTML = output;
    }
}

const log10 = Math.log(10);
function Log10(x) {
    return Math.log(x) / log10;
}

function getRoundedValue(value, sigFigs) {
    let digits = Math.round(Log10(value)) * -1;
    digits += sigFigs;
    let adjustment = Math.pow(10, digits);
    return Math.round(value * adjustment) / adjustment;

}

refresh();