import { dom } from "../../lib/common.js";

function View(model, update) {
    function myDom(attrs) {
        const mathField = dom("math-field", {
            class: model.paramsMap.has("printMode") ? "no-toggle-button" : "",
            value: model?.input?.tex ?? "",
            "math-virtual-keyboard-policy": "sandboxed",
            ...attrs,
        });
        mathField.addEventListener("input", function (e) {
            //model.input.tex = e.target.getValue();
            update({
                action: "setInput",
                value: {
                    json: e.target.getValue("math-json"),
                    tex: e.target.getValue(),
                },
            });
        });
        mathField.setValue(model?.input?.tex ?? "", {
            suppressChangeNotifications: true,
        });
        return mathField;
    }
    return { dom: myDom };
}

export { View };
