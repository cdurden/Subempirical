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
            //            const responseInputElmt = document.createElement("math-field");
            //            new Map([
            //                ["font-size", "32px"],
            //                ["margin", "3em"],
            //                ["padding", "8px"],
            //                ["border-radius", "8px"],
            //                ["border", "1px solid rgba(0, 0, 0, .3)"],
            //                ["box-shadow", "0 0 8px rgba(0, 0, 0, .2)"],
            //            ]).forEach(function (value, key) {
            //                responseInputElmt.style.setProperty(key, value);
            //            });
            //            responseInputElmt.value = model.data.response;
            //            viewContainerElmt.appendChild(responseInputElmt);
            //            responseInputElmt.addEventListener("change", function (event) {
            //                update(
            //                    { action: "updateModel", response: event.target.value },
            //                    self
            //                );
            //            });
            resolve(self);
        });
    }
    return Object.assign(self, {
        rootElement,
        render,
    });
}
function makeUpdateFunction(model) {
    return function update(message, view) {
        if (message.action === "updateModel") {
            model.data.response = message.response;
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
        // FIXME: don't need resolve here
        const promptModuleUrl = new URL(
            paramsMap.get("promptModuleUrl") ?? "/lib/math-prompts.js",
            paramsMap.get("repoBaseUrl") ?? window.location.href
        );
        import(promptModuleUrl).then(function (promptModule) {
            promptModule["getPrompt"](paramsMap).then(function (prompt) {
                data.prompt = prompt;
                resolve(
                    Object.assign(self, {
                        data,
                        exportModel,
                        //update,
                    })
                );
            });
        });
    });
}
function init(paramsMap) {
    const scriptSourceMap = new Map([
        [
            "localhost",
            [
                "/lib/mathjax/es5/tex-svg.js",
                "/lib/mathjax-openmiddle.js",
                //"/node_modules/mathlive/dist/mathlive.js",
                "/node_modules/showdown/dist/showdown.min.js",
                //"https://unpkg.com/@cortex-js/compute-engine?module",
                //"https://unpkg.com/mathlive?module",
                //"//unpkg.com/mathlive",
            ],
        ],
        [
            "other",
            [
                `${paramsMap.get("repoBaseUrl")}/lib/mathjax/es5/tex-svg.js`,
                `${paramsMap.get("repoBaseUrl")}/lib/mathjax-openmiddle.js`,
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
        return new Model(paramsMap).then(function (model) {
            const update = makeUpdateFunction(model);
            const view = new View(update);
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
