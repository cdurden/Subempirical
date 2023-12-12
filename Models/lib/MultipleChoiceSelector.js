import { dom } from "../../lib/common.js";

function View(model, update) {
    var activeButtonElmt;
    function myDom(attrs) {
        const selectElmt = dom(
            "select",
            {
                name: model.name,
                class: "multiple-choice-selector",
                multiple: "multiple",
            },
            model.choices.reduce(function (acc, choice) {
                const inputElmt = dom(
                    "option",
                    {
                        type: "radio",
                        //name: model.name,
                        value: choice.value,
                        ...(model.value === choice.value && {
                            checked: "checked",
                        }),
                    },
                    choice.label
                );
                inputElmt.addEventListener("change", function (e) {
                    update({
                        action: "setInput",
                        name: model.name,
                        value: e.target.value,
                    });
                });
                return [...acc, inputElmt, dom("label", {}, choice.label)];
            }, [])
        );
        const choiceButtonMap = new Map(
            model.choices.map(function (choice) {
                const buttonElmt = dom("button", {}, choice.label);
                buttonElmt.addEventListener("click", function (e) {
                    model.value = choice.value;
                    update({
                        action: "setInput",
                        name: model.name,
                        value: choice.value,
                    });
                    //activeButtonElmt = buttonElmt;

                    updateButtonStates();
                    //selectElmt.value = choice.value;
                });
                return [choice, buttonElmt];
            })
        );
        function updateButtonStates() {
            model.choices.map(function (choice) {
                const buttonElmt = choiceButtonMap.get(choice);
                if (model.value === choice.value) {
                    buttonElmt.classList.add("selected");
                } else {
                    buttonElmt.classList.remove("selected");
                }
            });
        }
        updateButtonStates();
        const buttonElmts = Array.from(choiceButtonMap.values());
        const buttonContainer = dom("div", {}, buttonElmts);
        return dom("div", {}, [buttonContainer]);
    }
    return { dom: myDom };
}

function init(paramsMap) {
    return Promise.resolve(new View(paramsMap.get("model")));
}

export { init, View };
