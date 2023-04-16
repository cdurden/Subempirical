import {
    any,
    all,
    getFile,
    mapReplacer,
    loadScript,
    composeUpdateThenRender,
} from "../lib/common.js";

function View(model, update) {
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
        update({
            action: "updateModel",
            response,
        });
    });
    const submitButtonElmt = document.createElement("button");
    submitButtonElmt.className = "pure-button pure-button-active";
    submitButtonElmt.textContent = "Submit";
    new Map([
        ["font-size", "32px"],
        ["width", "100%"],
        //["margin", "3em"],
        //["display", "inline"],
        ["padding", "8px"],
        ["border-radius", "8px"],
        ["border", "1px solid rgba(0, 0, 0, .3)"],
        ["box-shadow", "0 0 8px rgba(0, 0, 0, .2)"],
    ]).forEach(function (value, key) {
        responseInputElmt.style.setProperty(key, value);
    });
    responseContainerElmt.appendChild(responseInputContainerElmt);
    responseInputContainerElmt.appendChild(responseInputElmt);
    responseInputContainerElmt.appendChild(submitButtonElmt);
    submitButtonElmt.addEventListener("click", function (event) {
        update({
            action: "submit",
        });
    });
    function setPromptState(state) {
        responseInputElmt.setPromptState(state);
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
                //responseInputElmt.setAttribute("script-depth", "[0, 1]");
                responseInputElmt.textContent = model.data.value;
                if (model.paramsMap.get("fill-in-the-blank") === true) {
                    responseInputElmt.setAttribute("readonly", true);
                }
                //responseInputElmt.value = model.data.response;
                viewContainerElmt.appendChild(responseContainerElmt);
                self.renderFeedback().then(function (feedbackView) {
                    //rootElement.appendChild(feedbackView.rootElement);
                    responseContainerElmt.appendChild(feedbackView.rootElement);
                });
                resolve(self);
            });
        });
    }
    return Object.assign(self, {
        rootElement,
        renderFeedback,
        render,
        setPromptState,
    });
}
function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
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
            ],
        ],
        [
            "other",
            [
                "./lib/mathlive/dist/mathlive.js",
                //"https://unpkg.com/@cortex-js/compute-engine",
                //"https://unpkg.com/mathlive",
                //"https://cdn.jsdelivr.net/npm/mathlive@2994c497407d510edd1696ffd435299b12ff0980/dist/mathlive.min.js",
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
            paramsMap.get("repoBaseUrl") ?? window.location.href
        );
        const feedbackModuleUrl = new URL(
            "./Models/Feedback.js",
            paramsMap.get("repoBaseUrl") ?? window.location.href
        );
        return new Model(paramsMap).then(function (model) {
            const view = new View(model, update);
            var updateFeedback;
            function update(message) {
                if (message.action === "updateModel") {
                    model.data.response = message.response;
                } else if (message.action === "setPrompt") {
                    model.promptModel = message.promptModel;
                    view.promptView = message.promptView;
                } else if (message.action === "insertFeedback") {
                    updateFeedback = message.updateFeedback;
                    view.renderFeedback = message.renderFeedback;
                    view.showFeedback = message.showFeedback;
                } else if (message.action === "submit") {
                    if (updateFeedback === undefined) {
                        throw "submit called but updateFeedback has not been defined";
                    }
                    updateFeedback(model.data.response).then(function () {
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
                }
                return Promise.resolve(message);
            }

            return Promise.all([
                import(feedbackModuleUrl).then(function (feedbackModule) {
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
                                renderFeedback: feedbackMVU.view.render,
                                updateFeedback: function (response) {
                                    return feedbackMVU.update({
                                        action: "updateFeedback",
                                        response,
                                    });
                                    //feedbackMVU.model.updateFeedback
                                },
                            });
                            return feedbackMVU;
                        });
                }),
                import(mathPromptModuleUrl).then(function (mathPromptModule) {
                    return mathPromptModule
                        .init(paramsMap, update)
                        .then(function (promptMVU) {
                            update({
                                action: "setPrompt",
                                promptModel: promptMVU.model,
                                promptView: promptMVU.view,
                            });
                            return promptMVU;
                        });
                }),
            ]).then(function () {
                //update({ action: "init" });
                return { model, view, update };
            });
            //            });
        });
    });
}

export { init };
