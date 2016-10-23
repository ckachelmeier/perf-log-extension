const SF = 4;

let showGraph = false;

function refresh() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, "refresh", populateUI);
    });
}

function populateUI(response) {
    populateTable(response);
    populateChart(response);
}

function populateChart(response) {
    if (!response || !response.logs) {
        return;
    }
    let data = [];
    for (let log of response.logs) {
        const boxData = getLogBoxData(log);
        if (boxData.length > 0) {
            data.push(boxData[0]);
        }
        if (boxData.length > 1) {
            data.push(boxData[1]);
        }
    }
    
    Plotly.newPlot('chart', data);
}

function getLogBoxData(log) {
    let ys = [];
    let yf = [];
    let response = [];
    if (log.successes > 0) {
        ys.push(log.successMin,
                log.successAverage,
                log.successMax);
    }
    if (log.successes > 1) {
        ys.push(log.successAverage - log.successStandardDeviation / 2,
                log.successAverage + log.successStandardDeviation / 2);
    }

    if (log.failures > 0) {
        yf.push(log.failureMin,
                log.failureAverage,
                log.failureMax);
    }
    if (log.failures > 1) {
        yf.push(log.failureAverage - log.failureStandardDeviation / 2,
                log.failureAverage + log.failureStandardDeviation / 2);
    }
    if (ys.length > 0) {
        var trace = {
            x: ys,
            name: log.name,
            type: "box",
            marker: {
                color: "green"
            }
        };
        response.push(trace);
    }
    if (yf.length > 0) {
        var trace = {
            x: yf,
            name: log.name,
            type: "box",
            marker: {
                color: "red"
            }
        };
        response.push(trace);
    }
    return response;
}

function populateTable(response) {
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
    if (value !== value || value === null || value === undefined) {
        return "";
    }
    let digits = Math.round(Log10(value)) * -1;
    digits += sigFigs;
    let adjustment = Math.pow(10, digits);
    return Math.round(value * adjustment) / adjustment;

}

function toggleShowGraph() {
    showGraph = !showGraph;
    if (showGraph) {
        document.getElementById("btnView").innerText = "Hide Graph";
        document.getElementById("chart").style.display = "block";
    } else {
        document.getElementById("btnView").innerText = "Show Graph";
        document.getElementById("chart").style.display = "none";
    }
}

refresh();

document.getElementById("btnRefresh").addEventListener("click", refresh);
document.getElementById("btnView").addEventListener("click", toggleShowGraph);