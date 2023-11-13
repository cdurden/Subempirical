import { all, loadScript, dom } from "../lib/common.js";

function Model(paramsMap) {
    const self = Object.create(null);
    return Object.assign(self, { correct: false });
}
function View(model, update) {
    const children = [];
    const rootElement = document.createElement("div");
    var visible = false;
    function render(preact) {
        preact.render(dom(preact), rootElement);
        update({ action: "typeset", element: rootElement });
    }
    function myDom(preact) {
        const h = dom;
        return h(
            "div",
            {
                class: "tooltip",
                style: `display: ${visible ? "block" : "none"}`,
            },
            [h("div", {}, `${model.correct ? "Correct" : "Incorrect"}`)]
        );
    }
    function setVisible(value) {
        visible = value;
    }
    function addChild(child) {
        children.push(child);
    }
    return { rootElement, render, addChild, dom: myDom, setVisible };
}
function init(paramsMap, updateParent) {
    const model = Model(paramsMap);
    const view = new View(model, update);
    function update(message) {
        if (message.action === "addChild") {
            view.addChild(message.child);
        }
        if (message.action === "getFeedback") {
            model.correct = message.model.check(message.model, message.data);
            view.setVisible(true);
            updateParent({ action: "renderTask" });
            updateParent({ action: "postFeedback", correct: model.correct });
        }
        updateParent(message);
    }
    return Promise.resolve({ model, view, update });
}

export { init };
