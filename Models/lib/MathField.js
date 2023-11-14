import { dom } from "../../lib/common.js";

function View(model, update) {
    function myDom() {
        const mathField = dom("math-field", {
            class: model.paramsMap.has("printMode") ? "no-toggle-button" : "",
            value: model.input ?? "",
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
        mathField.setValue(model.input ?? "", {
            suppressChangeNotifications: true,
        });
        return mathField;
    }
    return { dom: myDom };
}

export { View };
