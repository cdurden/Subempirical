import { dom } from "../../lib/common.js";

function View(model, update) {
    function myDom(children) {
        return dom("div", { class: "feedback-container" }, [
            ...children.map(function (child) {
                return child.view.dom();
            }),
        ]);
    }
    return { dom: myDom };
}

export { View };
