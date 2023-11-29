import { dom } from "../../lib/common.js";
function Model(paramsMap) {
    return { correct: false };
}

function View(model, update) {
    var visible = true;
    //const children = [];
    const rootElement = document.createElement("div");
    var visible = false;
    function myDom(child) {
        return dom(
            "div",
            {
                class: "tooltip",
                style: `display: ${visible ? "block" : "none"}`,
            },
            [
                ...model.history.map(function (correct) {
                    return correct ? "✓" : "X";
                }),
                dom("div", {}, `${model.correct ? "Correct" : "Incorrect"}`),
            ]
        );
    }
    function setVisible(value) {
        visible = value;
    }
    return { dom: myDom, setVisible };
}

function init(paramsMap, updateParent) {
    const model = new Model(paramsMap);
    const view = new View(model, update);
    function update(message) {
        updateParent(message);
    }
    return Promise.resolve({ model, view, update });
}

export { init, View };
