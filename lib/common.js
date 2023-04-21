//import "./axios.min.js";

const localResourceMap = new Map([
    ["MathJax", ["./lib/mathjax-default.js", "./lib/mathjax/es5/tex-svg.js"]],
    [
        "Mathlive",
        [
            //"./node_modules/mathlive/dist/mathlive.js",
            "./lib/mathlive/dist/mathlive.js",
        ],
    ],
    [
        "Algebrite",

        ["./lib/algebrite.bundle-for-browser-min.js", "./lib/algebra-latex.js"],
    ],
    ["Showdown", ["./node_modules/showdown/dist/showdown.min.js"]],
]);
const remoteResourceMap = new Map([
    [
        "MathJax",
        [
            "./lib/mathjax-remote.js",
            "https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.min.js",
        ],
    ],
    [
        "Mathlive",
        [
            "./lib/mathlive/dist/mathlive.js",
            //"https://unpkg.com/@cortex-js/compute-engine",
            //"https://unpkg.com/mathlive",
            //"https://cdn.jsdelivr.net/npm/mathlive@2994c497407d510edd1696ffd435299b12ff0980/dist/mathlive.min.js",
        ],
    ],
    [
        "Algebrite",
        ["./lib/algebrite.bundle-for-browser-min.js", "./lib/algebra-latex.js"],
    ],
    [
        "Showdown",
        ["https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js"],
    ],
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
function getUrl(file) {
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
    return axios.get(getUrl(file), { ...localOptions, ...options });
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
function loadScript(url, options) {
    return new Promise(function (resolve) {
        // Adding the script tag to the head as suggested before
        var head = document.head;
        var script = document.createElement("script");
        script.type = options?.module === true ? "module" : "text/javascript";
        script.src = new URL(url, options?.baseURL ?? window.location.href);

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
function getResourceUrls(resourceName) {
    if (window.location.hostname === "localhost") {
        return localResourceMap.get(resourceName);
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
function loadResource(resourceName, options) {
    if (loadedResources.get(resourceName).loaded && !options.forceReload) {
        return Promise.resolve(loadedResources.get(resourceName).result);
    }
    return loadScriptsInSeries(getResourceUrls(resourceName), options).then(
        function (result) {
            loadedResources.set(resourceName, { loaded: true, result });
        }
    );
}

function loadResourcesInParallel(resourceNames, options) {
    return Promise.all(
        resourceNames.map(function (resourceName) {
            return loadResource(resourceName, options);
        })
    );
}

export {
    any,
    all,
    getFile,
    mapReplacer,
    mapReviver,
    loadScript,
    composeUpdateThenRender,
    ModalView,
    callWhenReady,
    loadResourcesInParallel,
};
