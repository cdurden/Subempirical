import { any, all, getFile, mapReplacer, loadScript } from "../lib/common.js";

function View(update, childViewsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    function render(model) {
        return new Promise(function (resolve) {
            rootElement.replaceChildren();
            const viewContainerElmt = document.createElement("div");
            /*
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
            */
            childViewsMap
                .get("prompt")
                .render(model.childModelsMap.get("prompt"))
                .then(function (promptView) {
                    viewContainerElmt.appendChild(promptView.rootElement);
                    rootElement.appendChild(viewContainerElmt);
                    const responseInputElmt = document.createElement(
                        "math-field"
                    );
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
                    responseInputElmt.addEventListener(
                        "change",
                        function (event) {
                            update(
                                {
                                    action: "updateModel",
                                    response: event.target.value,
                                },
                                self
                            );
                        }
                    );
                    resolve(self);
                });
        });
    }
    return Object.assign(self, {
        rootElement,
        render,
    });
}
function makeUpdateFunction(model, callbacks) {
    return function update(message, view) {
        if (message.action === "updateModel") {
            model.data.response = message.response;
        }
        /*
        if (message.action === "setPrompt") {
            model.data.prompt = message.prompt;
        }
        */
        //view.render(model);
        callbacks.forEach(function (callback) {
            callback(model);
        });
        return true;
    };
}

function Model(paramsMap, childModelsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const data = {
        prompt: childModelsMap.get("prompt").data.prompt,
        response: null,
    };
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
                childModelsMap,
                //update,
            })
        );
    });
}
function init(paramsMap, onUpdateCallbacks = []) {
    const scriptSourceMap = new Map([
        ["localhost", ["/node_modules/mathlive/dist/mathlive.js"]],
        [
            "other",
            [
                //"https://unpkg.com/@cortex-js/compute-engine",
                "https://unpkg.com/mathlive",
            ],
        ],
    ]);
    const hostname = window.location.hostname;
    const scriptSource = scriptSourceMap.has(hostname) ? hostname : "other";
    return Promise.all(
        scriptSourceMap.get(scriptSource).map(function (script) {
            return loadScript(script);
        })
    ).then(function (modules) {
        //const mathlive = modules[0];
        MathLive.renderMathInDocument();
        const mathPromptModuleUrl = new URL(
            "./Models/MathPrompt.js",
            paramsMap.get("repoBaseUrl") ?? window.location.href
        );
        return import(mathPromptModuleUrl).then(function (mathPrompt) {
            return mathPrompt.init(paramsMap).then(function (promptMVU) {
                return new Model(
                    paramsMap,
                    new Map([["prompt", promptMVU.model]])
                ).then(function (model) {
                    const update = makeUpdateFunction(model, onUpdateCallbacks);
                    const view = new View(
                        update,
                        new Map([["prompt", promptMVU.view]])
                    );
                    /*
                    update(
                        {
                            action: "setPrompt",
                            prompt: promptMVU.model.data.prompt,
                        },
                        view
                    );
                    */
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
