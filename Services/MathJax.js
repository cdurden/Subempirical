import { loadResource } from "../lib/common.js";

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
    const mathJaxQueue = [];
    var state = { ready: false };
    function callWhenReady(code) {
        if (state.ready) {
            code();
        } else {
            mathJaxQueue.push(code);
        }
    }
    return loadResource("MathJax-OpenMiddle-config", {
        baseURL: paramsMap.get("baseURL"),
    }).then(function (mathJaxConfigModule) {
        mathJaxConfigModule.setup(mathJaxQueue, state);
        console.log(MathJax);
        return loadResource(
            "MathJax",
            { baseURL: paramsMap.get("baseURL") },
            false
        ).then(function (mathJaxModule) {
            function update(message) {
                if (message.action === "typeset") {
                    function typesetElement() {
                        return typeset(function () {
                            return [message.element];
                        });
                    }
                    return callWhenReady(typesetElement);
                }
                return true;
            }
            return update;
        });
    });
}

export { init };
