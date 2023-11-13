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
    const viewContainerElmt = document.createElement("div");
    function modifyDom() {
        rootElement.replaceChildren();
        const converter = new showdown.Converter({ tables: true });
        if (typeof model.data.prompt === "string") {
            viewContainerElmt.innerHTML = converter.makeHtml(
                //`${label}. ${model.data.prompt}`
                `${model.data.prompt}`
            );
        }
        new Map([
            ["font-size", "13pt"],
            //["margin", "1em"],
            //["padding", "8px"],
        ]).forEach(function (value, key) {
            viewContainerElmt.style.setProperty(key, value);
        });

        rootElement.appendChild(viewContainerElmt);
        return [rootElement];
    }
    function addPromptView(promptView) {
        viewContainerElmt.appendChild(promptView.rootElement);
    }
    function render() {
        //return modifyDom();
        callWhenReady(
            "DOMContentLoadedAndMathJaxReady",
            window.mathJaxReady,
            typesetPrompt
        );
        return Promise.resolve(self);
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
        addPromptView,
    });
}
function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const data = { response: null };
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
            var generatePrompt;
            var generateFeedbackMessage;
            function update(message) {
                if (message.action === "updateModel") {
                    model.data.response = message.response;
                } else if (message.action === "setPrompt") {
                    model.data.prompt = message.prompt;
                } else if (message.action === "setValidator") {
                    updateParent(message);
                } else if (message.action === "setLabel") {
                    view.setLabel(message.label);
                } else if (message.action === "promptRendered") {
                    view.typesetPrompt();
                }
                return true;
            }
            return import(mathModelModuleUrl)
                .then(function (mathModelModule) {
                    generatePrompt = mathModelModule.generatePrompt;
                    generateFeedbackMessage =
                        mathModelModule.generateFeedbackMessage;
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
