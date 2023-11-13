import { any, all, getFile, mapReplacer, loadScript } from "../lib/common.js";

import { init as initMessage } from "./Message.js";

function View(model, update) {
    const self = Object.create(null);
    const rootElement = document.createElement("div");
    const feedbackContainer = document.createElement("div");
    Object.setPrototypeOf(self, View.prototype);
    function virtualDom(preact) {
        return preact.render(
            model.generateFeedback(preact.h, model.params, update),
            rootElement
        );
    }
    function render(preact) {
        /*
         */
        return preact.render(virtualDom(preact));
        return Promise.resolve();
    }
    return Object.assign(self, {
        rootElement,
        render,
        virtualDom,
    });
}
function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    return Promise.resolve(Object.assign(self, {}));
}
function init(paramsMap, updateParent = function () {}) {
    const feedbackModelModuleUrl = new URL(
        paramsMap.get("feedbackModel"),
        paramsMap.get("baseURL") ?? window.location.href
    );
    return import(feedbackModelModuleUrl).then(function (feedbackModelModule) {
        return feedbackModelModule
            .init(paramsMap, updateParent)
            .then(function (feedbackMVU) {
                return new Model(paramsMap).then(function (model) {
                    const view = feedbackMVU.view;
                    Object.assign(model, feedbackModelModule);
                    function update(message) {
                        if (message.action === "render") {
                            view.render();
                        }
                        //feedbackModelMVU.update(message);
                        return true;
                    }
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
