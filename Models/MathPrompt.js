import { any, all, getFile, mapReplacer, loadScript } from "../lib/common.js";

var typesetPromise = Promise.resolve(); // Used to hold chain of typesetting calls

function typeset(code) {
    typesetPromise = typesetPromise
        .then(() => MathJax.typesetPromise(code()))
        .catch((err) => console.log("Typeset failed: " + err.message));
    return typesetPromise;
}
function View(model, update) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    function typesetPrompt() {
        return typeset(modifyDom).then(function () {
            return self;
        });
    }
    function modifyDom() {
        rootElement.replaceChildren();
        const viewContainerElmt = document.createElement("div");
        const converter = new showdown.Converter({ tables: true });
        viewContainerElmt.innerHTML = converter.makeHtml(model.data.prompt);
        new Map([
            ["font-size", "32px"],
            //["margin", "1em"],
            //["padding", "8px"],
        ]).forEach(function (value, key) {
            viewContainerElmt.style.setProperty(key, value);
        });

        rootElement.appendChild(viewContainerElmt);
        return [rootElement];
    }
    function render() {
        //return modifyDom();
        return typesetPrompt();
    }
    return Object.assign(self, {
        rootElement,
        render,
        typesetPrompt,
    });
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
    // FIXME: don't need resolve here
    const mathModelModuleUrl = new URL(
        paramsMap.get("mathModel") ?? "./Models/MathExpression.js",
        paramsMap.get("repoBaseUrl") ?? window.location.href
    );
    return import(mathModelModuleUrl).then(function (mathModelModule) {
        return mathModelModule.init(paramsMap).then(function (mathModelMVU) {
            data.prompt = mathModelMVU.model.prompt();
            return Object.assign(self, {
                data,
                exportModel,
                //update,
            });
        });
    });
}
function init(
    paramsMap,
    updateParent = function () {
        return Promise.resolve();
    }
) {
    const scriptSourceMap = new Map([
        [
            "localhost",
            [
                "./lib/mathjax/es5/tex-svg.js",
                "./lib/mathjax-default.js",
                "./node_modules/showdown/dist/showdown.min.js",
            ],
        ],
        [
            "other",
            [
                `./lib/mathjax/es5/tex-svg.js`,
                `./lib/mathjax-default.js`,
                "https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js",
            ],
        ],
    ]);
    const hostname = window.location.hostname;
    const scriptSource = scriptSourceMap.has(hostname) ? hostname : "other";
    return Promise.all(
        scriptSourceMap.get(scriptSource).map(function (script) {
            return loadScript(script, { baseURL: paramsMap.get("baseURL") });
        })
    ).then(function (modules) {
        return new Model(paramsMap).then(function (model) {
            const view = new View(model, update);
            function update(message) {
                if (message.action === "updateModel") {
                    model.data.response = message.response;
                }
                return true;
            }
            /*
            updateParent({
                action: "addEventListener",
                eventName: "mounted",
                listener: function () {
                    MathJax.startup.promise.then(() => {
                        if (document.readyState === "loading") {
                            // Loading hasn't finished yet
                            document.addEventListener(
                                "DOMContentLoaded",
                                view.typesetPrompt
                            );
                        } else {
                            // `DOMContentLoaded` has already fired
                            view.typesetPrompt();
                        }
                    });
                },
            });
            */

            return {
                model,
                view,
                update,
            };
        });
    });
}

export { init };
