import {
    any,
    all,
    getFile,
    mapReplacer,
    loadResource,
    loadScript,
} from "../lib/common.js";

function View(model, update, paramsMap) {
    const self = Object.create(null);
    const promptViews = [];
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    function addPrompt(promptView) {
        promptViews.push(promptView);
        rootElement.appendChild(promptView.rootElement);
    }
    function render() {
        return Promise.all(
            promptViews.map(function (promptView) {
                promptView.render();
            })
        );
    }
    return Object.assign(self, {
        rootElement,
        render,
        addPrompt,
    });
}

function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const data = { prompt: "What is your name?", response: null };
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
                exportModel,
            })
        );
    });
}
function init(paramsMap, updateParent) {
    const feedbackModuleUrl = new URL(
        paramsMap.get("feedbackModuleUrl") ?? "./Models/AutoCheckerFeedback.js",
        paramsMap.get("baseURL") ?? window.location.href
    );
    const promptModuleUrl = new URL(
        paramsMap.get("promptModule") ?? "./Models/lib/MathModels/Prompt.js",
        //paramsMap.get("promptModule") ?? "./Models/HtmPrompt.js",
        paramsMap.get("baseURL") ?? window.location.href
    );
    const mathJaxWrapperModuleUrl = new URL(
        "./Models/MathJaxWrapper.js",
        paramsMap.get("baseURL") ?? window.location.href
    );
    const paramGeneratorModuleUrl = new URL(
        paramsMap.get("paramGeneratorModel") ??
            "./Models/AlgebriteParamGenerator.js",
        paramsMap.get("baseURL") ?? window.location.href
    );
    const moduleUrls = [
        promptModuleUrl,
        paramGeneratorModuleUrl,
        feedbackModuleUrl,
    ];
    return Promise.all([
        loadResource("Mathlive"),
        loadResource("CortexJS-Compute-Engine"),
        import(mathJaxWrapperModuleUrl),
        ...moduleUrls.map(function (moduleUrl) {
            return import(moduleUrl);
        }),
    ]).then(function ([
        mathliveModule,
        computeEngineModule,
        mathJaxWrapperModule,
        promptModule,
        paramGeneratorModule,
        feedbackModule,
    ]) {
        const feedbackMVUs = [];
        return mathJaxWrapperModule
            .init(paramsMap, updateParent)
            .then(function (mathJaxWrapperMVU) {
                return new Model(paramsMap).then(function (model) {
                    const view = new View(model, update);
                    function update(message) {
                        if (message.action === "submit") {
                            //updateFeedback(promptMVU.model.generateFeedbackMessage());
                            //promptMVU.view.render();
                            feedbackMVUs.forEach(function (feedbackMVU) {
                                feedbackMVU.update({
                                    action: "getFeedback",
                                    data: message.data,
                                    model: message.model,
                                });
                            });
                            view.render();
                        } else if (message.action === "renderTask") {
                            view.render();
                        }
                        if (message.action === "typeset") {
                            mathJaxWrapperMVU.update(message);
                        }
                        updateParent(message);
                    }
                    promptModule
                        .init(paramsMap, update)
                        .then(function (promptMVU) {
                            feedbackModule
                                .init(paramsMap, update)
                                .then(function (feedbackMVU) {
                                    feedbackMVUs.push(feedbackMVU);
                                    promptMVU.update({
                                        action: "addChild",
                                        child: feedbackMVU,
                                    });
                                });
                            paramGeneratorModule
                                .init(paramsMap, update)
                                .then(function (paramGeneratorMVU) {
                                    promptMVU.update({
                                        action: "setParams",
                                        params: paramGeneratorMVU.model.params,
                                    });
                                });
                            view.addPrompt(promptMVU.view);
                            promptMVU.update({ action: "render" });
                        });
                    return {
                        model,
                        view,
                        update,
                    };
                });
            });
    });
}

export { init };
