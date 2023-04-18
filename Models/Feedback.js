import { any, all, getFile, mapReplacer, loadScript } from "../lib/common.js";

import { init as initMessage } from "./Message.js";

function View(model, update) {
    const self = Object.create(null);
    const childViews = [];
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    function render() {
        rootElement.replaceChildren();
        rootElement.appendChild(self.messageView.rootElement);
        return Promise.resolve(self);
    }
    return Object.assign(self, {
        messageView: undefined,
        rootElement,
        render,
    });
}
function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    self.validate = function () {
        return false;
    };
    function setValidator(validate) {
        self.validate = validate;
    }
    const data = {
        prompt: self.promptModel?.data?.prompt,
        response: null,
    };
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
    const mathModelModuleUrl = new URL(
        paramsMap.get("mathModel") ?? "./Models/MathExpression.js",
        paramsMap.get("repoBaseUrl") ?? window.location.href
    );
    /*
    return import(mathModelModuleUrl).then(function (mathModelModule) {
        return mathModelModule.init(paramsMap).then(function (mathModelMVU) {
            function updateFeedback(response) {
                if (mathModelMVU.model.validate(response)) {
                    self.message = "Correct";
                } else {
                    self.message = "Incorrect";
                }
                return Promise.resolve();
            }
            return Object.assign(self, {
                data,
                message: undefined,
                //updateFeedback,
                promptModel: undefined,
            });
        });
    });
    */
    return Promise.resolve(
        Object.assign(self, {
            data,
            message: undefined,
            //updateFeedback,
            promptModel: undefined,
            setValidator,
        })
    );
}
function init(paramsMap, updateParent = function () {}) {
    const scriptSourceMap = new Map([
        ["localhost", []],
        ["other", []],
    ]);
    const hostname = window.location.hostname;
    const scriptSource = scriptSourceMap.has(hostname) ? hostname : "other";
    return Promise.all(
        scriptSourceMap.get(scriptSource).map(function (script) {
            return loadScript(script);
        })
    ).then(function (modules) {
        return new Model(paramsMap).then(function (model) {
            const mathModelModuleUrl = new URL(
                paramsMap.get("mathModel") ?? "./Models/MathExpression.js",
                paramsMap.get("baseURL") ?? window.location.href
            );
            /*return import(mathModelModuleUrl).then(function (mathModelModule) {
                return mathModelModule
                    .init(paramsMap)
                    .then(function (mathModelMVU) {
                    */
            const view = new View(model, update);
            var messageUpdate;
            function update(message) {
                if (message.action === "setModal") {
                    view.messageView = message.messageView;
                    messageUpdate = message.messageUpdate;
                    view.render();
                } else if (message.action === "showFeedback") {
                    messageUpdate({ action: "show" });
                } else if (message.action === "hideFeedback") {
                    messageUpdate({ action: "hide" });
                } else if (message.action === "submit") {
                    if (model.validate(message.response)) {
                        model.message = "Correct";
                        updateParent({
                            action: "setTaskState",
                            state: "correct",
                        });
                    } else {
                        model.message = "Incorrect";
                        updateParent({
                            action: "setTaskState",
                            state: "incorrect",
                        });
                    }
                    messageUpdate({
                        action: "updateModal",
                        messageSpec: {
                            header: "",
                            className: "tooltip",
                            body: `${model.message}`,
                            buttons: [
                                /*
                                            {
                                                textContent: "Okay",
                                                onClick: function () {
                                                    update(
                                                        {
                                                            action:
                                                                "hideFeedback",
                                                        },
                                                        model
                                                    );
                                                },
                                            },
                                            */
                            ],
                        },
                    });
                    return Promise.resolve(message);
                } else if (message.action === "setValidator") {
                    model.setValidator(message.validate);
                }
            }
            return initMessage(new Map(), update).then(function (messageMVU) {
                update({
                    action: "setModal",
                    messageUpdate: messageMVU.update,
                    messageView: messageMVU.view,
                });
                return {
                    model,
                    view,
                    update,
                };
            });
            /*
                    });
            });
    */
        });
    });
}

export { init };
