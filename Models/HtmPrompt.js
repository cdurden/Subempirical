import { all, loadResource } from "../lib/common.js";

function View(model, update) {
    const self = Object.create(null);
    const rootElement = document.createElement("div");
    const feedbackContainer = document.createElement("div");
    var promptView;
    Object.setPrototypeOf(self, View.prototype);
    function render(preact) {
        promptView.render(preact);
        return Promise.resolve();
    }
    function addPromptView(newPromptView) {
        promptView = newPromptView;
        rootElement.appendChild(promptView.rootElement);
    }
    return Object.assign(self, {
        rootElement,
        render,
        addPromptView,
    });
}
function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const params = {};
    return Promise.resolve(
        Object.assign(self, {
            params,
        })
    );
}
function init(
    paramsMap,
    updateParent = function () {
        return Promise.resolve();
    }
) {
    const promptModuleUrl = new URL(
        paramsMap.get("promptModule") ?? "./Models/lib/MathModels/Prompt.js",
        paramsMap.get("baseURL") ?? window.location.href
    );
    const feedbackModuleUrl = new URL(
        paramsMap.get("feedbackModule") ?? "./Models/AutoCheckerFeedback.js",
        paramsMap.get("baseURL") ?? window.location.href
    );
    return Promise.all([
        loadResource("Preact", {}, true),
        import(promptModuleUrl),
        import(feedbackModuleUrl),
    ]).then(function ([preact, promptModule, feedbackModule]) {
        return new Model(paramsMap).then(function (model) {
            const view = new View(model, updateHtmPrompt);
            const feedbackMVUs = [];
            function updateHtmPrompt(message) {
                if (message.action === "submit") {
                    feedbackMVUs.forEach(function (feedbackMVU) {
                        feedbackMVU.update({
                            action: "getFeedback",
                            data: message.data,
                            model: message.model,
                        });
                    });
                    view.render(preact);
                }
                if (message.action === "addPrompt") {
                    view.addPromptView(message.prompt.view);
                }
                updateParent(message);
            }
            return promptModule
                .init(paramsMap, updateHtmPrompt)
                .then(function (promptMVU) {
                    return feedbackModule
                        .init(paramsMap, updateParent)
                        .then(function (feedbackMVU) {
                            feedbackMVUs.push(feedbackMVU);
                            promptMVU.update({
                                action: "addChild",
                                child: feedbackMVU,
                            });
                            updateHtmPrompt({
                                action: "addPrompt",
                                prompt: promptMVU,
                            });
                            function update(message) {
                                if (message.action === "setParams") {
                                    //promptMVU.model.setParams(message.params);
                                    promptMVU.update(message);
                                    //feedbackMVU.model.setParams(message.params);
                                    //model.params = message.params;
                                    //view.render(preact);
                                    view.render(preact);
                                    /*
                                    view.rootElement.appendChild(
                                        promptMVU.view.rootElement
                                    );
                                    */
                                    //view.render(preact);
                                }
                                if (message.action === "submit") {
                                    promptMVU.view.render(preact);
                                }
                                updateParent(message);
                            }
                            return {
                                model,
                                view,
                                update,
                            };
                        });
                });
        });
    });
}

export { init };
