//import "./axios.min.js";
//import jsonpath-lite.min.js

const localResourceMap = new Map([
    ["MathJax-config", "/lib/mathjax-default.js"],
    ["MathJax", "/lib/mathjax/es5/tex-svg.js"],
    [
        "Mathlive",
        "/node_modules/mathlive/dist/mathlive.js",
        //"./mathlive/dist/mathlive.js",
    ],
    [
        "CortexJS-Compute-Engine",
        "/node_modules/@cortex-js/compute-engine/dist/compute-engine.min.js?module",
    ],
    ["Algebrite", "/lib/algebrite.bundle-for-browser-min.js"],
    ["Algebra-latex", "/lib/algebra-latex.js"],
    ["Showdown", "/node_modules/showdown/dist/showdown.min.js"],
]);
const remoteResourceMap = new Map([
    ["Preact", "https://unpkg.com/htm/preact/standalone.module.js"],
    ["MathJax-config", "./lib/mathjax-remote.js"],

    [
        "CortexJS-Compute-Engine",
        "https://unpkg.com/@cortex-js/compute-engine?module",
    ],
    [
        "MathJax",
        "https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.min.js",
    ],
    ["Mathlive", "https://unpkg.com/mathlive"],
    ["Algebrite", "./lib/algebrite.bundle-for-browser-min.js"],
    ["Algebra-latex", "./lib/algebra-latex.js"],
    [
        "Showdown",
        "https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js",
    ],
]);
const resourceMaps = new Map([
    ["local", localResourceMap],
    ["remote", remoteResourceMap],
]);
const loadedResources = new Map(
    [
        ...Array.from(localResourceMap.keys()),
        ...Array.from(remoteResourceMap.keys()),
    ].map(function (resourceName) {
        return [resourceName, { loaded: false }];
    })
);
function ModalView(model, update) {
    const self = Object.create(null);
    //var rootElement = document.createElement("div");
    const modalBackdropElmt = document.createElement("div");
    Object.setPrototypeOf(self, ModalView.prototype);
    function render() {
        function show() {
            modalBackdropElmt.style.display = "block";
        }
        function hide() {
            modalBackdropElmt.style.display = "none";
            document.removeEventListener("keydown", keyboardHandler);
        }
        const keyboardHandler = function (event) {
            if (event.key === "Escape") {
                hide();
            } else if (event.key === "Enter") {
                model.onSubmit(model);
                hide();
            }
        };
        return new Promise(function (resolve) {
            modalBackdropElmt.replaceChildren();
            show();
            //modalBackdropElmt = document.createElement("div");
            //rootElement.appendChild(modalBackdropElmt);
            modalBackdropElmt.classList.add("modal-backdrop");
            const modalElmt = document.createElement("div");
            //modalElmt.replaceWith();
            modalElmt.classList.add("modal");
            modalBackdropElmt.appendChild(modalElmt);
            const modalHeaderElmt = document.createElement("div");
            modalHeaderElmt.classList.add("modal-header");
            modalHeaderElmt.textContent = model.header;
            modalElmt.appendChild(modalHeaderElmt);
            const modalBodyElmt = document.createElement("div");
            modalBodyElmt.classList.add("modal-body");
            modalBodyElmt.innerHTML = model.body;
            modalElmt.appendChild(modalBodyElmt);
            const focusable = modalBodyElmt.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length > 0) {
                focusable[0].focus();
                focusable[0].select();
            }
            const modalOkButtonElmt = document.createElement("button");
            modalOkButtonElmt.textContent = "OK";
            modalBodyElmt.appendChild(modalOkButtonElmt);
            const modalCancelButtonElmt = document.createElement("button");
            modalCancelButtonElmt.textContent = "Cancel";
            modalBodyElmt.appendChild(modalCancelButtonElmt);
            modalOkButtonElmt.addEventListener("click", function () {
                model.onSubmit(model);
            });
            modalCancelButtonElmt.addEventListener("click", function () {
                hide();
            });
            document.addEventListener("keydown", keyboardHandler);
        });
    }
    return Object.assign(self, {
        rootElement: modalBackdropElmt,
        render,
    });
}

function composeUpdateThenRender(update, render, renderParams) {
    const updateThenRender = function (message, model, view) {
        return update(message, model, view).then(function () {
            render(model, updateThenRender, renderParams);
        });
    };
    return updateThenRender;
}
function getUrl(file, options) {
    return new URL(file, options?.baseURL ?? window.location.href);
    return file;
}
const responseTypes = new Map([
    ["json", "application/json"],
    ["js", "text/javascript"],
]);
function getExtension(file) {
    return file.split(".").pop();
}

function getFile(file, options) {
    const localOptions = {
        responseType: responseTypes.get(getExtension(file)),
    };
    return axios.get(getUrl(file, options), { ...localOptions, ...options });
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

function joinPath(...parts) {
    return parts.reduce(function (acc, part) {
        if (typeof part === "string" && part.startsWith("$")) {
            return part;
            //} else if (acc === "$") {
            //    return `${acc}${part}`;
        } else {
            return `${acc}.${part}`;
        }
    }, "$");
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

function zip(x, y) {
    return x.map(function (entry, index) {
        return [x[index], y[index]];
    });
}

function createUserStatsElements(userStats) {
    const statsElement = document.createElement("div");
}
function callWhenReady(readyEvent, isReady, code) {
    if (!isReady) {
        // Loading hasn't finished yet
        return new Promise(function (resolve) {
            document.addEventListener(readyEvent, function () {
                code().then(function (result) {
                    resolve(result);
                });
            });
        });
    } else {
        // `DOMContentLoaded` has already fired
        return code();
    }
}
function loadStylesheet(url, options) {
    return new Promise(function (resolve) {
        // Adding the script tag to the head as suggested before
        var head = document.head;
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = new URL(`${url}`, window.location.href);
        link.onreadystatechange = function () {
            resolve();
        };
        link.onload = function () {
            resolve();
        };
        head.appendChild(link);
    });
}

function loadScript(url, options) {
    return new Promise(function (resolve) {
        // Adding the script tag to the head as suggested before
        var head = document.head;
        var script = document.createElement("script");
        script.type = options?.module === true ? "module" : "text/javascript";
        script.src = new URL(url, options?.baseURL ?? window.location.href);
        //script.src = new URL(`./lib/${url}`, window.location.href);

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = function () {
            resolve();
        };
        script.onload = function () {
            resolve();
        };

        // Fire the loading
        head.appendChild(script);
    });
}
function loadScriptsInParallel(scripts, options) {
    return Promise.all(
        scripts.map(function (script) {
            return loadScript(script, options);
        })
    );
}
function getResourceUrl(resourceName) {
    if (window.location.hostname === "localhost") {
        return (
            localResourceMap.get(resourceName) ??
            remoteResourceMap.get(resourceName)
        );
    } else {
        return remoteResourceMap.get(resourceName);
    }
}
function loadScriptsInSeries(scripts, options) {
    return scripts.reduce(function (promiseAccumulator, script) {
        return promiseAccumulator.then(function (resultAccumulator) {
            return loadScript(script, options).then(function (result) {
                return [...resultAccumulator, result];
            });
        });
    }, Promise.resolve([]));
}
function loadResource(resourceName, options, dynamicImport = true) {
    if (loadedResources.get(resourceName).loaded && !options?.forceReload) {
        return Promise.resolve(loadedResources.get(resourceName).result);
    }
    if (dynamicImport) {
        return import(getResourceUrl(resourceName));
    }
    return loadScript(getResourceUrl(resourceName), options).then(function (
        result
    ) {
        loadedResources.set(resourceName, { loaded: true, result });
    });
}

function loadResourcesInParallel(resourceNames, options) {
    return Promise.all(
        resourceNames.map(function (resourceName) {
            return loadResource(resourceName, options);
        })
    );
}

function query(paramsMap, path) {
    const pathParts = path.split(".");
    return pathParts.reduce(function (acc, pathPart) {
        return acc.get(pathPart);
    }, paramsMap);
}

/* wee dom function from https://www.crockford.com/domjs.html */
function dom(tag, attributes, nodes = []) {
    const node = document.createElement(tag);
    Object.entries(attributes).forEach(function ([k, v]) {
        node.setAttribute(k, v);
    });
    node.append(...nodes);
    return node;
}
function range(start, end, step = 1) {
    const out = [];
    for (let i = start; i < end; i = i + step) {
        out.push(i);
    }
    return out;
}
function repeat(x, n) {
    const reps = [];
    for (let i = 0; i < n; i++) {
        reps.push(x);
    }
    return reps;
}

export {
    any,
    range,
    repeat,
    all,
    dom,
    getFile,
    mapReplacer,
    mapReviver,
    loadScript,
    loadStylesheet,
    composeUpdateThenRender,
    ModalView,
    callWhenReady,
    loadResourcesInParallel,
    query,
    joinPath,
    resourceMaps,
    loadResource,
    getResourceUrl,
    zip,
};
