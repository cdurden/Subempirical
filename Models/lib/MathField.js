import { dom } from "../../lib/common.js";

function View(model, update) {
    function myDom() {
        const mathField = dom("math-field", {
            value: model.input ?? "",
            style: "display: block",
            "math-virtual-keyboard-policy": "sandboxed",
        });
        mathField.addEventListener("input", function (e) {
            update({
                action: "setInput",
                value: {
                    json: e.target.getValue("math-json"),
                    tex: e.target.getValue(),
                },
            });
        });
        return mathField;
    }
    return { dom: myDom };
}

export { View };
