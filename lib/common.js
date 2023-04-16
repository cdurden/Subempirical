//import "./axios.min.js";

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
export {
    any,
    all,
    getFile,
    mapReplacer,
    mapReviver,
    loadScript,
    composeUpdateThenRender,
    ModalView,
};
