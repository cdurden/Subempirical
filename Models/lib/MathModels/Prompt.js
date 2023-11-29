import * as SubmitButton from "../SubmitButton.js";
import * as FeedbackMessage from "../FeedbackMessage.js";
import { dom, loadStylesheet } from "../../../lib/common.js";
import * as Base from "./Base.js";

function Model(paramsMap) {
    return new Base.Model(paramsMap).then(function (model) {
        model.history = [];
        function setPrompt(prompt) {
            model.prompt = prompt;
        }
        function setChecker(check) {
            model.check = check;
        }
        function setLabel(label) {
            model.label = label;
        }
        return Object.assign(model, { setPrompt, setChecker, setLabel });
    });
}

function View(model, update) {
    const self = new Base.View(model, update);
    var inputDom;
    function myDom(children) {
        //const { a, b, m, n } = model.params;
        loadStylesheet("./Models/lib/MathModels/styles/math-prompt.css", {
            baseURL: model.paramsMap.get("baseURL"),
        });
        return dom("div", { class: "math-prompt" }, children);
    }
    return Object.assign(self, { wrap: myDom });
}

function init(paramsMap, updateParent) {
    return new Model(paramsMap).then(function (model) {
        const view = new View(model, update);
        const update = updateFactory(model, view, updateParent);
        //view.setInputDom(model.inputDom(model, update, view.children));
        return { model, view, update };
    });
}

function updateFactory(model, view, updateParent) {
    function update(message) {
        if (message.action === "addChild") {
            view.addChild(message.childId, message.child);
        } else if (message.action === "setLabel") {
            model.setLabel(message.label);
        } else if (message.action === "postFeedback") {
            model.correct = message.correct;
            /*view.setInputDom(
                        promptModel.inputDom(model, update, view.children)
                    );
                    view.render();
                    */
        } else if (message.action === "setParams") {
            model.setParams(message.params);
            //model.setPrompt(model.prompt({}));
            //view.setInputDom(view.inputDom(update, view.children));
            //view.render();
            update({ action: "typeset", element: view.rootElement });
            //} else if (message.action === "setPrompt") {
            //    model.setPrompt(message.prompt);
            return Promise.resolve();
        } else if (message.action === "render") {
            view.render();
        } else {
            updateParent(message);
        }
    }
    return update;
}
export { Model, View, init, updateFactory };
