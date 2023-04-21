import {
    any,
    all,
    getFile,
    mapReplacer,
    loadScript,
    callWhenReady,
} from "../lib/common.js";

var typesetPromise = Promise.resolve(); // Used to hold chain of typesetting calls

function flatten(arr) {
    return arr.reduce(function (rowAccumulator, rowA) {
        return [...rowAccumulator, ...rowA];
    }, []);
}
function typeset(code) {
    typesetPromise = typesetPromise
        .then(() => MathJax.typesetPromise(code()))
        .catch((err) => console.log("Typeset failed: " + err.message));
    return typesetPromise;
}
function View(model, update, paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    const renderPrompt = function () {
        return Promise.reject();
    };
    const renderFeedback = function () {
        return Promise.reject();
    };
    const responseContainerElmt = document.createElement("div");
    const responseInputContainerElmt = document.createElement("div");
    responseInputContainerElmt.style.setProperty("display", "flex");

    //responseContainerElmt.style.setProperty("width", "80%");
    //MathLive.makeSharedVirtualKeyboard();
    const areaModelTableElmt = document.createElement("table");
    areaModelTableElmt.className = "area-model";
    const areaOutputElmt = document.createElement("div");
    new Map([
        ["font-size", "24pt"],
        ["width", "100%"],
        ["min-height", "1em"],
        ["margin", "8px"],
        //["display", "inline"],
        ["overflow", "visible"],
        ["padding", "8px"],
        ["width", "100%"],
    ]).forEach(function (value, key) {
        areaOutputElmt.style.setProperty(key, value);
    });
    const lengthInputElmtsMap = new Map();
    const widthInputElmtsMap = new Map();
    const areaInputElmtsMap = new Map();
    [undefined, ...Array.from(model.lengthParts.keys())].forEach(function (
        lengthPart
    ) {
        const areaModelRowElmt = document.createElement("tr");
        [undefined, ...Array.from(model.widthParts.keys())].forEach(function (
            widthPart
        ) {
            if (lengthPart === undefined) {
                if (widthPart === undefined) {
                    const emptyCellElmt = document.createElement("th");
                    areaModelRowElmt.appendChild(emptyCellElmt);
                } else {
                    const widthHeadingCellElmt = document.createElement("th");
                    const widthInputElmt = document.createElement("math-field");
                    widthInputElmt.addEventListener("change", function (event) {
                        update({
                            action: "setWidth",
                            widthPart,
                            value: event.target.value,
                        });
                    });
                    widthHeadingCellElmt.appendChild(widthInputElmt);
                    areaModelRowElmt.appendChild(widthHeadingCellElmt);
                    widthInputElmtsMap.set(widthPart, widthInputElmt);
                }
            } else {
                if (widthPart === undefined) {
                    const lengthHeadingCellElmt = document.createElement("th");
                    const lengthInputElmt = document.createElement(
                        "math-field"
                    );
                    lengthInputElmt.addEventListener(
                        "change",
                        function (event) {
                            update({
                                action: "setLength",
                                lengthPart,
                                value: event.target.value,
                            });
                        }
                    );
                    lengthHeadingCellElmt.appendChild(lengthInputElmt);
                    areaModelRowElmt.appendChild(lengthHeadingCellElmt);
                    lengthInputElmtsMap.set(lengthPart, lengthInputElmt);
                } else {
                    const areaCellElmt = document.createElement("td");
                    /*
                    const areaInputElmt = document.createElement("math-field");
                    areaInputElmt.value = model.areaParts.get(
                        `${lengthPart},${widthPart}`
                    );
                    */
                    const areaInputElmt = document.createElement("span");
                    const areaPart = model.areaParts.get(
                        `${lengthPart},${widthPart}`
                    );
                    areaInputElmt.textContent =
                        areaPart === "0" ? "" : "$" + areaPart + "$";
                    areaCellElmt.appendChild(areaInputElmt);
                    areaModelRowElmt.appendChild(areaCellElmt);
                    areaInputElmtsMap.set(
                        `${lengthPart},${widthPart}`,
                        areaInputElmt
                    );
                }
            }
        });
        areaModelTableElmt.appendChild(areaModelRowElmt);
    });
    Array.from(areaInputElmtsMap.values()).forEach(function (inputElmt) {
        new Map([
            ["font-size", "24pt"],
            ["width", "100%"],
            ["min-height", "1em"],
            ["margin", "8px"],
            //["display", "inline"],
            ["overflow", "visible"],
            ["padding", "8px"],
        ]).forEach(function (value, key) {
            inputElmt.style.setProperty(key, value);
        });
    });
    [
        ...Array.from(lengthInputElmtsMap.values()),
        ...Array.from(widthInputElmtsMap.values()),
        //...Array.from(areaInputElmtsMap.values()),
    ].forEach(function (inputElmt) {
        inputElmt.setAttribute("math-virtual-keyboard-policy", "sandboxed");
        new Map([
            ["font-size", "24pt"],
            ["width", "100%"],
            ["min-height", "1em"],
            ["margin", "8px"],
            //["display", "inline"],
            ["overflow", "visible"],
            ["padding", "8px"],
            ["border-radius", "8px"],
            ["border", "1px solid rgba(0, 0, 0, .3)"],
            ["box-shadow", "0 0 8px rgba(0, 0, 0, .2)"],
        ]).forEach(function (value, key) {
            inputElmt.style.setProperty(key, value);
        });
    });
    const responseInputElmt = document.createElement("math-field");
    responseInputElmt.setAttribute("math-virtual-keyboard-policy", "sandboxed");
    //responseInputElmt.setAttribute("use-shared-virtual-keyboard", true);
    responseInputElmt.addEventListener("change", function (event) {
        const response = model.paramsMap.has("responseFields")
            ? new Map(
                  model.paramsMap
                      .get("responseFields")
                      .map(function (fieldName) {
                          return [
                              fieldName,
                              responseInputElmt.getPromptValue(fieldName),
                          ];
                      })
              )
            : event.target.value;
        //const response = event.target.value;
        update({
            action: "updateModel",
            response,
        });
    });
    const submitButtonElmt = document.createElement("button");
    submitButtonElmt.className = "pure-button pure-button-active";
    submitButtonElmt.textContent = "Submit";
    responseContainerElmt.appendChild(responseInputContainerElmt);
    responseInputContainerElmt.appendChild(areaModelTableElmt);
    submitButtonElmt.addEventListener("click", function (event) {
        update({
            action: "submit",
            data: model.data,
            taskId: model.paramsMap.get("taskId"),
        });
    });
    function typesetAreas() {
        return typeset(modifyDom).then(function () {
            return self;
        });
    }
    function modifyDom() {
        Array.from(lengthInputElmtsMap).forEach(function ([
            lengthPart,
            lengthInputElmt,
        ]) {
            lengthInputElmt.value = model.lengthParts.get(lengthPart);
        });
        Array.from(widthInputElmtsMap).forEach(function ([
            widthPart,
            widthInputElmt,
        ]) {
            widthInputElmt.value = model.widthParts.get(widthPart);
        });
        Array.from(areaInputElmtsMap).forEach(function ([
            areaPart,
            areaInputElmt,
        ]) {
            //areaInputElmt.value = model.areaParts.get(areaPart);
            const areaPartValue = model.areaParts.get(areaPart);
            areaInputElmt.textContent =
                areaPartValue === "0" ? "" : "$" + areaPartValue + "$";
        });
        areaOutputElmt.textContent =
            "Total area: " +
            (model.area === "0"
                ? "0"
                : "$" +
                  model.area +
                  /*
                  " = (" +
                  model.length +
                  ")(" +
                  model.width + ")" +
                  */
                  "$");
        return [rootElement];
    }
    function render() {
        MathLive.renderMathInDocument();
        //window.mathVirtualKeyboard._boundingRect = { height: undefined };
        return new Promise(function (resolve) {
            rootElement.replaceChildren();
            const viewContainerElmt = document.createElement("div");
            rootElement.appendChild(viewContainerElmt);
            viewContainerElmt.appendChild(self.promptView.rootElement);
            self.promptView.render().then(function () {
                responseInputElmt.textContent = model.data.value;
                if (model.paramsMap.get("fill-in-the-blank") === true) {
                    responseInputElmt.setAttribute("readonly", true);
                }
                viewContainerElmt.appendChild(responseContainerElmt);
                viewContainerElmt.appendChild(areaOutputElmt);
                viewContainerElmt.appendChild(submitButtonElmt);
                callWhenReady(
                    "DOMContentLoadedAndMathJaxReady",
                    window.mathJaxReady,
                    typesetAreas
                );
                self.renderFeedback()
                    .then(function (feedbackView) {
                        //rootElement.appendChild(feedbackView.rootElement);
                        responseContainerElmt.appendChild(
                            feedbackView.rootElement
                        );
                    })
                    .catch(function () {});
                resolve(self);
            });
        });
    }
    return Object.assign(self, {
        rootElement,
        renderFeedback,
        render,
    });
}
function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const lengthParts = new Map([
        ["a", ""],
        ["b", ""],
    ]);
    const widthParts = new Map([
        ["c", ""],
        ["d", ""],
    ]);
    const areaParts = new Map(
        Array.from(lengthParts.keys()).reduce(function (
            outerAccumulator,
            lengthPart
        ) {
            return [
                ...outerAccumulator,
                ...Array.from(widthParts.keys()).reduce(function (
                    innerAccumulator,
                    widthPart
                ) {
                    return [
                        ...innerAccumulator,
                        [`${lengthPart},${widthPart}`, "0"],
                    ];
                },
                []),
            ];
        },
        [])
    );
    const data = {
        prompt: self.promptModel?.data?.prompt,
        value: paramsMap.get("value"),
    };
    function setCompleted(value) {
        data.completed = value;
    }
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
                promptModel: undefined,
                exportModel,
                paramsMap,
                setCompleted,
                lengthParts,
                widthParts,
                areaParts,
                area: "0",
            })
        );
    });
}
function init(
    paramsMap,
    updateParent = function (message) {
        return Promise.resolve(message);
    }
) {
    const scriptSourceMap = new Map([
        [
            "localhost",
            [
                //"./node_modules/mathlive/dist/mathlive.js",
                "./lib/mathlive/dist/mathlive.js",
                "./lib/mathjax/es5/tex-svg.js",
                "./lib/mathjax-default.js",
                "./lib/algebrite.bundle-for-browser-min.js",
                "./lib/algebra-latex.js",
            ],
        ],
        [
            "other",
            [
                "./lib/mathlive/dist/mathlive.js",
                //"https://unpkg.com/@cortex-js/compute-engine",
                //"https://unpkg.com/mathlive",
                //"https://cdn.jsdelivr.net/npm/mathlive@2994c497407d510edd1696ffd435299b12ff0980/dist/mathlive.min.js",
                "./lib/algebrite.bundle-for-browser-min.js",
                "./lib/algebra-latex.js",
                "https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.min.js",
                "./lib/mathjax-remote.js",
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
        const mathPromptModuleUrl = new URL(
            "./Models/MathPrompt.js",
            paramsMap.get("baseURL") ?? window.location.href
        );
        const feedbackModuleUrl = new URL(
            "./Models/Feedback.js",
            paramsMap.get("baseURL") ?? window.location.href
        );
        return new Model(paramsMap).then(function (model) {
            const view = new View(model, update, paramsMap);
            var updateFeedback;
            var promptUpdate;
            var validate;
            function updateAreaParts() {
                const area = Algebrite.expand(
                    Array.from(model.lengthParts).reduce(function (
                        accAreaOuterSum,
                        [lengthPart, length]
                    ) {
                        const innerSum = Array.from(model.widthParts).reduce(
                            function (accAreaInnerSum, [widthPart, width]) {
                                const indexPair = `${lengthPart},${widthPart}`;
                                try {
                                    if (length === "" || width === "") {
                                        throw "length or width undefined";
                                    }
                                    model.areaParts.set(
                                        indexPair,
                                        Algebrite.simplify(
                                            `(${length})*(${width})`
                                        ).toLatexString()
                                    );
                                } catch {
                                    model.areaParts.set(indexPair, "0");
                                } finally {
                                    return `${accAreaInnerSum}+${model.areaParts.get(
                                        indexPair
                                    )}`;
                                }
                            },
                            "0"
                        );
                        return `${accAreaOuterSum}+${innerSum}`;
                    },
                    "0")
                ).toLatexString();
                model.area = area;
            }
            function updateLength() {
                try {
                    model.length = Algebrite.parse(
                        Array.from(model.lengthParts).reduce(function (
                            lengthExprAccumulator,
                            [lengthParts, value]
                        ) {
                            if (value === "") {
                                return lengthExprAccumulator;
                            }
                            return lengthExprAccumulator === "0"
                                ? value
                                : `${lengthExprAccumulator}+${value}`;
                        },
                        "0")
                    ).toLatexString();
                } catch {
                    model.length = "0";
                }
            }
            function updateWidth() {
                try {
                    model.width = Algebrite.parse(
                        Array.from(model.widthParts).reduce(function (
                            widthExprAccumulator,
                            [widthParts, value]
                        ) {
                            if (value === "") {
                                return widthExprAccumulator;
                            }
                            return widthExprAccumulator === "0"
                                ? value
                                : `${widthExprAccumulator}+${value}`;
                        },
                        "0")
                    ).toLatexString();
                } catch {
                    model.width = "0";
                }
            }
            function update(message) {
                if (message.action === "setLength") {
                    model.lengthParts.set(message.lengthPart, message.value);
                    updateAreaParts();
                    updateLength();
                    view.render();
                } else if (message.action === "setWidth") {
                    model.widthParts.set(message.widthPart, message.value);
                    updateWidth();
                    updateAreaParts();
                    view.render();
                } else if (message.action === "setPrompt") {
                    model.promptModel = message.promptModel;
                    view.promptView = message.promptView;
                    promptUpdate = message.promptUpdate;
                } else if (message.action === "setLabel") {
                    promptUpdate(message);
                } else if (message.action === "insertFeedback") {
                    updateFeedback = message.updateFeedback;
                    view.renderFeedback = message.renderFeedback;
                    view.showFeedback = message.showFeedback;
                    updateFeedback({ action: "setValidator", validate });
                } else if (message.action === "submit") {
                    if (updateFeedback === undefined) {
                        throw "submit called but updateFeedback has not been defined";
                    }
                    updateFeedback({
                        action: "submit",
                        response: `(${model.length})(${model.width})`,
                    }).then(function () {
                        view.showFeedback();
                    });
                    message.data = model.data;
                    message.paramsMap = paramsMap;
                    return updateParent(message);
                } else if (message.action === "setTaskState") {
                    if (message.state === "correct") {
                        model.setCompleted(true);
                        updateParent({ action: "setCompleted", value: true });
                    } else {
                        model.setCompleted(false);
                        updateParent({ action: "setCompleted", value: false });
                    }

                    //view.setPromptState(message.state);
                } else if (message.action === "setValidator") {
                    validate = message.validate;
                    if (updateFeedback !== undefined) {
                        updateFeedback(message);
                    }
                }
                return Promise.resolve(message);
            }

            return import(mathPromptModuleUrl)
                .then(function (mathPromptModule) {
                    return mathPromptModule
                        .init(paramsMap, update)
                        .then(function (promptMVU) {
                            import(feedbackModuleUrl).then(function (
                                feedbackModule
                            ) {
                                return feedbackModule
                                    .init(paramsMap, update)
                                    .then(function (feedbackMVU) {
                                        update({
                                            action: "insertFeedback",
                                            showFeedback: function () {
                                                feedbackMVU.update({
                                                    action: "showFeedback",
                                                });
                                            },
                                            renderFeedback:
                                                feedbackMVU.view.render,
                                            updateFeedback: feedbackMVU.update,
                                        });
                                        return feedbackMVU;
                                    });
                            });
                            update({
                                action: "setPrompt",
                                promptModel: promptMVU.model,
                                promptView: promptMVU.view,
                                promptUpdate: promptMVU.update,
                            });
                            return promptMVU;
                        });
                })
                .then(function () {
                    //update({ action: "init" });
                    return { model, view, update };
                });
            //            });
        });
    });
}

export { init };
