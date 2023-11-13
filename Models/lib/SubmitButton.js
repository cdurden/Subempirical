import { dom } from "../../lib/common.js";

function View(model, update) {
    function myDom() {
        const submitButton = dom("button", {}, "Submit");
        submitButton.addEventListener("click", function () {
            const response = model.input;
            update({
                action: "submit",
                data: response,
                model,
            });
        });
        return submitButton;
    }
    return { dom: myDom };
}

export { View };
