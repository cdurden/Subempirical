import { callWhenReady, loadResource } from "../lib/common.js";

var typesetPromise = Promise.resolve(); // Used to hold chain of typesetting calls

function typeset(code) {
    const elements = code();
    MathJax.typesetClear(elements);
    typesetPromise = typesetPromise
        .then(() => MathJax.typesetPromise(elements))
        .catch((err) => console.log("Typeset failed: " + err.message));
    return typesetPromise;
}

function init(paramsMap, updateParent) {
    return Promise.all([
        loadResource("MathJax", { baseURL: paramsMap.get("baseURL") }, false),
        loadResource(
            "MathJax-config",
            { baseURL: paramsMap.get("baseURL") },
            false
        ),
    ]).then(function ([mathJaxModule, mathJaxConfig]) {
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
        return update;
    });
}

export { init };
