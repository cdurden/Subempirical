import {
    any,
    all,
    getFile,
    mapReplacer,
    callWhenReady,
    loadResourcesInParallel,
} from "../lib/common.js";

var typesetPromise = Promise.resolve(); // Used to hold chain of typesetting calls

function typeset(code) {
    typesetPromise = typesetPromise
        .then(() => MathJax.typesetPromise(code()))
        .catch((err) => console.log("Typeset failed: " + err.message));
    return typesetPromise;
}
function View(model, update, paramsMap) {
    const self = Object.create(null);
    var typesetComplete = false;
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    var label = "";
    function setLabel(_label) {
        label = _label;
    }
    function typesetPrompt() {
        return typeset(modifyDom).then(function () {
            return self;
        });
    }
    function modifyDom() {
        rootElement.replaceChildren();
        const viewContainerElmt = document.createElement("div");
        const converter = new showdown.Converter({ tables: true });
        viewContainerElmt.innerHTML = converter.makeHtml(
            //`${label}. ${model.data.prompt}`
            `${model.data.prompt}`
        );
        new Map([
            ["font-size", "16pt"],
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
        return callWhenReady(
            "DOMContentLoadedAndMathJaxReady",
            window.mathJaxReady,
            typesetPrompt
        );
        /*
        if (!typesetComplete) {
            document.addEventListener(
                "DOMContentLoadedAndMathJaxReady",
                function () {
                    typesetPrompt().then(function () {
                        typesetComplete = true;
                    });
                }
            );
        }
        return typesetPrompt();
        */
    }
    return Object.assign(self, {
        rootElement,
        render,
        typesetPrompt,
        setLabel,
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
    return Promise.resolve(
        Object.assign(self, {
            data,
            exportModel,
            //update,
        })
    );
    // FIXME: don't need resolve here
}
function init(paramsMap, updateParent) {
    return loadResourcesInParallel(
        ["MathJax", "Mathlive", "Algebrite", "Showdown"],
        {
            baseURL: paramsMap.get("baseURL"),
        }
    ).then(function (modules) {
        return new Model(paramsMap).then(function (model) {
            const view = new View(model, update);
            const mathModelModuleUrl = new URL(
                paramsMap.get("mathModel") ?? "./Models/MathExpression.js",
                paramsMap.get("baseURL") ?? window.location.href
            );
            function update(message) {
                if (message.action === "updateModel") {
                    model.data.response = message.response;
                } else if (message.action === "setPrompt") {
                    model.data.prompt = message.prompt;
                } else if (message.action === "setValidator") {
                    updateParent(message);
                } else if (message.action === "setLabel") {
                    view.setLabel(message.label);
                }
                return true;
            }
            return import(mathModelModuleUrl)
                .then(function (mathModelModule) {
                    return mathModelModule
                        .init(paramsMap, update)
                        .then(function (mathModelMVU) {
                            update({
                                action: "setPrompt",
                                prompt: mathModelMVU.model.prompt(),
                            });
                            //data.prompt = mathModelMVU.model.prompt();
                        });
                })
                .then(function () {
                    return {
                        model,
                        view,
                        update,
                    };
                });
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
