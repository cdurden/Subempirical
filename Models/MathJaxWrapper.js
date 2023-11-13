import {
    any,
    all,
    getFile,
    mapReplacer,
    callWhenReady,
    loadResource,
    loadResourcesInParallel,
} from "../lib/common.js";

var typesetPromise = Promise.resolve(); // Used to hold chain of typesetting calls

function typeset(code) {
    const elements = code();
    MathJax.typesetClear(elements);
    typesetPromise = typesetPromise
        .then(() => MathJax.typesetPromise(elements))
        .catch((err) => console.log("Typeset failed: " + err.message));
    return typesetPromise;
}

function View(model, update, paramsMap) {
    const self = Object.create(null);
    var typesetComplete = false;
    Object.setPrototypeOf(self, View.prototype);
    function render() {
        return Promise.resolve(self);
    }
    return Object.assign(self, {
        render,
    });
}
function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    return Promise.resolve(
        Object.assign(self, {
            //update,
        })
    );
    // FIXME: don't need resolve here
}
function init(paramsMap, updateParent) {
    return Promise.all([
        loadResource("MathJax", {}, false),
        loadResource("MathJax-config", {}, false),
    ]).then(function ([mathJaxModule, mathJaxConfig]) {
        return new Model(paramsMap).then(function (model) {
            const view = new View(model, update);
            function update(message) {
                if (message.action === "typeset") {
                    function typesetElement() {
                        typeset(function () {
                            return [message.element];
                        });
                    }
                    callWhenReady(
                        "DOMContentLoadedAndMathJaxReady",
                        window.mathJaxReady,
                        typesetElement
                    );
                }
                return true;
            }
            return {
                model,
                view,
                update,
            };
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
