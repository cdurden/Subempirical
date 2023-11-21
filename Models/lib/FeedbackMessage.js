import { dom } from "../../lib/common.js";

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
            [dom("div", {}, `${model.correct ? "Correct" : "Incorrect"}`)]
        );
    }
    function setVisible(value) {
        visible = value;
    }
    return { dom: myDom, setVisible };
}

export { View };
