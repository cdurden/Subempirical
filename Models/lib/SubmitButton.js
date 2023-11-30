import { dom } from "../../lib/common.js";

function View(model, update) {
    function myDom() {
        const submitButton = dom("button", {}, "Submit");
        var enabled = false;
        submitButton.disabled = true;
        var timeout = setTimeout(function () {
            enabled = true;
            submitButton.disabled = false;
        }, 5000);
        submitButton.addEventListener("click", function () {
            const response = model.input;
            if (enabled) {
                enabled = false;
                submitButton.disabled = true;
                if (timeout !== undefined) clearTimeout(timeout);
                timeout = setTimeout(function () {
                    enabled = true;
                    submitButton.disabled = false;
                }, 5000);
                update({
                    action: "submit",
                    data: response,
                    model,
                });
            }
        });
        return submitButton;
    }
    return { dom: myDom };
}

export { View };
