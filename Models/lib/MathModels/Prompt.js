import * as SubmitButton from "../SubmitButton.js";
import * as FeedbackMessage from "../FeedbackMessage.js";
import { dom, loadStylesheet } from "../../../lib/common.js";
import * as Base from "./Base.js";

function Model(paramsMap) {
    return new Base.Model(paramsMap).then(function (model) {
        function setPrompt(prompt) {
            model.prompt = prompt;
        }
        function setChecker(check) {
            model.check = check;
        }
        return Object.assign(model, { setPrompt, setChecker });
    });
}

function View(model, update) {
    const self = new Base.View(model, update);
    var inputDom;
    function myDom() {
        //const { a, b, m, n } = model.params;
        loadStylesheet("./Models/lib/MathModels/styles/math-prompt.css");
        const h = dom;
        return h("div", { class: "math-prompt" }, [
            h("p", {}, model.prompt),
            inputDom,
            new FeedbackMessage.View(model, update).dom(self.children),
            //new MathField.View(model, update).dom(),
            ...(model.paramsMap.get("printMode")
                ? []
                : [new SubmitButton.View(model, update).dom()]),
        ]);
    }
    function setInputDom(newInputDom) {
        inputDom = newInputDom;
    }
    return Object.assign(self, { dom: myDom, setInputDom });
}

function init(paramsMap, updateParent) {
    const promptModelModuleUrl = new URL(
        paramsMap.get("promptModel"),
        paramsMap.get("baseURL") ?? window.location.href
    );
    return import(promptModelModuleUrl).then(function (promptModel) {
        return new Model(paramsMap).then(function (model) {
            model.setChecker(promptModel.check);
            const view = new View(model, update);
            view.setInputDom(promptModel.inputDom(model, update));
            function update(message) {
                if (message.action === "addChild") {
                    view.addChild(message.child);
                } else if (message.action === "setParams") {
                    model.setParams(message.params);
                    model.setPrompt(promptModel.prompt(model));
                    view.setInputDom(promptModel.inputDom(model, update));
                    view.render();
                    //} else if (message.action === "setPrompt") {
                    //    model.setPrompt(message.prompt);
                } else {
                    updateParent(message);
                }
            }
            return { model, view, update };
        });
    });
}

export { Model, View, init };
