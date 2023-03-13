import { any, all, getFile, mapReplacer, loadScript } from "../lib/common.js";

function View(update) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    function render(model) {
        return new Promise(function (resolve) {
            rootElement.replaceChildren();
            const viewContainerElmt = document.createElement("div");
            const converter = new showdown.Converter({ tables: true });
            //html = converter.makeHtml(model.data.prompt);
            //viewContainerElmt.textContent = model.data.prompt;
            viewContainerElmt.innerHTML = converter.makeHtml(model.data.prompt);
            new Map([
                ["font-size", "32px"],
                ["margin", "1em"],
                ["padding", "8px"],
            ]).forEach(function (value, key) {
                viewContainerElmt.style.setProperty(key, value);
            });

            rootElement.appendChild(viewContainerElmt);
            const responseInputElmt = document.createElement("math-field");
            new Map([
                ["font-size", "32px"],
                ["margin", "3em"],
                ["padding", "8px"],
                ["border-radius", "8px"],
                ["border", "1px solid rgba(0, 0, 0, .3)"],
                ["box-shadow", "0 0 8px rgba(0, 0, 0, .2)"],
            ]).forEach(function (value, key) {
                responseInputElmt.style.setProperty(key, value);
            });
            responseInputElmt.value = model.data.response;
            viewContainerElmt.appendChild(responseInputElmt);
            responseInputElmt.addEventListener("change", function (event) {
                update(
                    { action: "updateModel", response: event.target.value },
                    self
                );
            });
            resolve(self);
        });
    }
    return Object.assign(self, {
        rootElement,
        render,
    });
}
function makeUpdateFunction(model, callback) {
    return function update(message, view) {
        if (message.action === "updateModel") {
            model.data.response = message.response;
        }
        if (message.action === "setPrompt") {
            model.data.prompt = message.prompt;
        }
        //view.render(model);
        return true;
    };
}

function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const data = { prompt: "", response: null };
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
function init(paramsMap) {
    const scripts = [
        //"/lib/mathjax/es5/tex-svg.js",
        //"/lib/mathjax-openmiddle.js",
        "/lib/mathlive/mathlive.js",
        //"/node_modules/showdown/dist/showdown.min.js",
        //"https://unpkg.com/@cortex-js/compute-engine?module",
        //"https://unpkg.com/mathlive?module",
        //"//unpkg.com/mathlive",
    ];
    return Promise.all([
        //import("/node_modules/mathlive/dist/mathlive.js"),
        ...scripts.map(function (script) {
            return loadScript(script);
        }),
    ]).then(function (modules) {
        //const mathlive = modules[0];
        MathLive.renderMathInDocument();
        return import("/Models/MathPrompt.js").then(function (mathPrompt) {
            return mathPrompt.init(paramsMap).then(function (promptMVU) {
                return new Model(paramsMap).then(function (model) {
                    const update = makeUpdateFunction(model);
                    const view = new View(update);
                    update(
                        {
                            action: "setPrompt",
                            prompt: promptMVU.model.data.prompt,
                        },
                        view
                    );
                    return { model, view, update };
                });
            });
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
