import { any, all, getFile, mapReplacer, loadScript } from "../lib/common.js";

function View(update) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    function render(model) {
        return new Promise(function (resolve) {
            resolve(self);
        });
    }
    return Object.assign(self, {
        rootElement,
        render,
    });
}
function makeUpdateFunction(model, callbacks) {
    return function update(message, view) {
        if (message.action === "createPolypad") {
            model.polypadInstance = message.polypadInstance;
        } else if (message.action === "change") {
            model.data.polypadData = model.polypadInstance.serialize();
        }
        //view.render(model);
        callbacks.forEach(function (callback) {
            callback(model);
        });
        return true;
    };
}

function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const data = { polypadData: null };
    function exportModel() {
        const blob = new Blob([JSON.stringify(data, mapReplacer)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.setAttribute("href", url);
        anchor.setAttribute("download", `model.json`);
        const clickHandler = function () {
            setTimeout(function () {
                URL.revokeObjectURL(url);
                anchor.removeEventListener("click", clickHandler);
            }, 150);
        };
        anchor.addEventListener("click", clickHandler, false);
        anchor.click();
    }
    return new Promise(function (resolve) {
        resolve(
            Object.assign(self, {
                data,
                exportModel,
                //update,
            })
        );
    });
}
function init(paramsMap, onUpdateCallbacks = []) {
    const scriptSourceMap = new Map([
        ["localhost", ["https://static.mathigon.org/api/polypad-en-v4.5.4.js"]],
        ["other", ["https://static.mathigon.org/api/polypad-en-v4.5.4.js"]],
    ]);
    const hostname = window.location.hostname;
    const scriptSource = scriptSourceMap.has(hostname) ? hostname : "other";
    return Promise.all(
        scriptSourceMap.get(scriptSource).map(function (script) {
            return loadScript(script);
        })
    ).then(function (modules) {
        return new Model(paramsMap).then(function (model) {
            const update = makeUpdateFunction(model, onUpdateCallbacks);
            const view = new View(update);
            Polypad.create(view.rootElement, {
                apiKey: "test",
                toolbar: false,
                settings: false,
            }).then(function (polypadInstance) {
                polypadInstance.setOptions({
                    sidebar: "fraction-circles",
                });
                polypadInstance.on("change", function () {
                    update({ action: "change" });
                });
                update({
                    action: "createPolypad",
                    polypadInstance,
                });
            });
            return { model, view, update };
        });
    });
}

function main(paramsMap, onUpdate) {
    const container = document.getElementById("virginia-content");
    init(paramsMap).then(function (mvu) {
        container.appendChild(mvu.view.rootElement);
        mvu.view.render(mvu.model).then(function (view) {
            const exportModelLink = document.createElement("a");
            exportModelLink.textContent = "Export";
            exportModelLink.addEventListener("click", mvu.model.exportModel);
            container.appendChild(exportModelLink);
            MathJax.startup.defaultPageReady();
            //MathJax.typeset();
        });
    });
}
export { init, main, Model };
