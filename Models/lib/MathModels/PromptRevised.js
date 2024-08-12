import * as SubmitButton from "../SubmitButton.js";
import * as FeedbackMessage from "../FeedbackMessage.js";
import { dom, loadStylesheet } from "../../../lib/common.js";
import * as Base from "./Base.js";

function Model(paramsMap) {
    return new Base.Model(paramsMap).then(function (model) {
        model.history = [];
        model.children = new Map();
        function setPrompt(prompt) {
            model.prompt = prompt;
        }
        function setChecker(check) {
            model.check = check;
        }
        function setLabel(label) {
            model.label = label;
        }
        function addChild(childId, childModel) {
            model.children.set(childId, childModel);
        }
        return Object.assign(model, {
            addChild,
            setPrompt,
            setChecker,
            setLabel,
        });
    });
}

function View(model, update) {
    const view = new Base.View(model, update);
    var inputDom;
    function myDom(children) {
        //const { a, b, m, n } = model.params;
        loadStylesheet("./Models/lib/MathModels/styles/math-prompt.css", {
            baseURL: model.paramsMap.get("baseURL"),
        });
        return dom("div", { class: "math-prompt" }, children);
    }
    function render() {
        view.rootElement.appendChild(myDom([view.dom()]));
        return update({
            action: "typeset",
            element: view.rootElement,
        }).then(function () {
            return view.rootElement;
        });
        return Promise.resolve(view);
    }
    return Object.assign(view, { wrap: myDom, render });
}

function init(paramsMap, updateParentServices) {
    updateParent = updateParentServices.get("parent");
    const paramGeneratorModuleUrl = new URL(
        paramsMap.get("paramGeneratorModel") ??
            "./Models/AlgebriteParamGenerator.js",
        paramsMap.get("baseURL") ?? window.location.href
    );
    Promise.all([
        loadResource("Mathlive"),
        import(paramGeneratorModuleUrl),
    ]).then(function ([mathliveModule, paramGeneratorModule]) {
        paramGeneratorModule
            .init(paramsMap, update)
            .then(function (paramGeneratorMVU) {
                updateParent({
                    action: "setParams",
                    params: paramGeneratorMVU.model.params,
                });
            });
        const updateChildren = new Map([]);
        function update(message) {
            if (message.action === "addChildren") {
                return Promise.all(
                    Array.from(message.children.entries()).map(function ([
                        childId,
                        childMVU,
                    ]) {
                        view.addChild(childId, childMVU.view);
                        model.addChild(childId, childMVU.model);
                        updateChildren.set(childId, childMVU.update);
                        return Promise.resolve(childMVU);
                    })
                );
            } else if (message.action === "initChildren") {
                return Promise.all(
                    Array.from(message.children.entries()).map(function ([
                        childId,
                        init,
                    ]) {
                        return init(
                            model.paramsMap,
                            new Map([
                                ...updateParentServices,
                                ["parent", function () {}],
                            ])
                        ).then(function (childMVU) {
                            view.addChild(childId, childMVU.view);
                            model.addChild(childId, childMVU.model);
                            updateChildren.set(childId, childMVU.update);
                            return childMVU;
                        });
                    })
                );
            } else if (message.action === "updateChildren") {
                Array.from(updateChildren.entries()).forEach(function ([
                    childName,
                    updateChild,
                ]) {
                    updateChild(message.message);
                });
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
                view.render();
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
        //view.setInputDom (model.inputDom(model, update, view.children));
        return { model: undefined, view: undefined, update };
    });
}

export { Model, View, init };
