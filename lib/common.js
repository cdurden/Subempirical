import "./axios.min.js";
function getUrl(file) {
    return file;
}
function getFile(file, options) {
    return axios.get(getUrl(file), options);
}
// Taken from https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
function mapReplacer(key, value) {
    if (value instanceof Map) {
        return {
            data: Array.from(value.entries()), // or with spread: value: [...value]
            dataType: "Map",
        };
    } else {
        return value;
    }
}

function mapReviver(key, value) {
    if (typeof value === "object" && value !== null) {
        if (value.dataType === "Map") {
            return new Map(value.data);
        }
    }
    return value;
}
function take(n, elmts) {
    const results = [];
    elmts.forEach(function (elmt, i) {
        if (i < n) results.push(elmt);
    });
    return results;
}
function all(bools) {
    return bools.reduce(function (acc, bool) {
        return acc && bool;
    }, true);
}
function any(bools) {
    return bools.reduce(function (acc, bool) {
        return acc || bool;
    }, false);
}

function createUserStatsElements(userStats) {
    const statsElement = document.createElement("div");
}
export { any, all, getFile, mapReplacer, mapReviver };
