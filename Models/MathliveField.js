import {
    any,
    all,
    getFile,
    mapReplacer,
    loadScript,
    composeUpdateThenRender,
} from "../lib/common.js";

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
    new Map([
        ["font-size", "24pt"],
        ["width", "100%"],
        ["min-height", "1em"],
        //["margin", "3em"],
        //["display", "inline"],
        ["overflow", "visible"],
        ["padding", "8px"],
        ["border-radius", "8px"],
        ["border", "1px solid rgba(0, 0, 0, .3)"],
        ["box-shadow", "0 0 8px rgba(0, 0, 0, .2)"],
    ]).forEach(function (value, key) {
        responseInputElmt.style.setProperty(key, value);
    });
    if (paramsMap.has("printMode")) {
        responseInputElmt.classList.add("no-toggle-button");
        responseInputElmt.style.setProperty("border", "0px");
        responseInputElmt.style.setProperty("box-shadow", "none");
        const responseSpaceElmt = document.createElement("div");
        //responseSpaceElmt.style.setProperty("height", "12em");
        //responseContainerElmt.appendChild(responseSpaceElmt);
        responseInputContainerElmt.appendChild(responseInputElmt);
        //responseContainerElmt.appendChild(responseInputContainerElmt);
    } else {
        responseContainerElmt.appendChild(responseInputContainerElmt);
        responseInputContainerElmt.appendChild(responseInputElmt);
        responseInputContainerElmt.appendChild(submitButtonElmt);
    }
    submitButtonElmt.addEventListener("click", function (event) {
        update({
            action: "submit",
            model: model,
            //data: model.data,
            //taskId: model.paramsMap.get("taskId"),
        });
    });
    function setPromptState(state) {
        responseInputElmt.setPromptState(state);
    }
    function render() {
        //MathLive.renderMathInDocument();
        //window.mathVirtualKeyboard._boundingRect = { height: undefined };
        return new Promise(function (resolve) {
            rootElement.replaceChildren();
            const viewContainerElmt = document.createElement("div");
            rootElement.appendChild(viewContainerElmt);
            viewContainerElmt.appendChild(self.promptView.rootElement);
            self.promptView.render().then(function () {
                //responseInputElmt.setAttribute("script-depth", "[0, 1]");
                if (model.paramsMap.get("fill-in-the-blank") === true) {
                    responseInputElmt.setAttribute("readonly", true);
                    responseInputElmt.textContent = model.data.value;
                } else {
                    responseInputElmt.textContent = model.data.response;
                }
                viewContainerElmt.appendChild(responseContainerElmt);
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
                //"./lib/mathlive/dist/mathlive.js",
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
        const mathModelModuleUrl = new URL(
            "./Models/MathModel.js",
            paramsMap.get("baseURL") ?? window.location.href
        );
        /*
        const mathPromptModuleUrl = new URL(
            "./Models/MathPrompt.js",
            paramsMap.get("baseURL") ?? window.location.href
        );
        */
        const feedbackModuleUrl = new URL(
            "./Models/Feedback.js",
            paramsMap.get("baseURL") ?? window.location.href
        );
        return new Model(paramsMap).then(function (model) {
            const view = new View(model, update, paramsMap);
            var updateFeedback;
            var promptUpdate;
            var validate;
            function update(message) {
                if (message.action === "updateModel") {
                    model.data.response = message.response;
                } else if (message.action === "updateFeedback") {
                    updateFeedback(message);
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
                        response: model.data.response,
                    }).then(function () {
                        view.showFeedback();
                    });
                    //message.data = model.data;
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
                } else if (message.action === "loadSubmissions") {
                    Object.assign(
                        model.data,
                        JSON.parse(message.submissions.pop()?.[4] ?? "{}")
                    );
                    view.render();
                }
                updateParent(message);
                return Promise.resolve(message);
            }
            updateParent({ action: "getSubmissions", model, update });

            return import(mathModelModuleUrl)
                .then(function (mathModelModule) {
                    return mathModelModule
                        .init(paramsMap, update)
                        .then(function (mathModelMVU) {
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
                                mathModelModel: mathModelMVU.model,
                                mathModelView: mathModelMVU.view,
                                mathModelUpdate: mathModelMVU.update,
                            });
                            return mathModelMVU;
                        });
                })
                .then(function () {
                    //update({ action: "init" });
                    return { model, view, update };
                });
            /*
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
            */
        });
    });
}

export { init };
