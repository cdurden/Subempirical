import * as MathField from "../MathField.js";
import * as SubmitButton from "../SubmitButton.js";
import { init as initFeedback } from "../../AutoCheckerFeedback.js";
import { init as initAreaModel } from "../../AreaModelSvg.js";
import { dom } from "../../../lib/common.js";
import * as Prompt from "./Prompt.js";

function Model(paramsMap) {
    const rand = paramsMap.get("rand");
    return new Prompt.Model(paramsMap).then(function (model) {
        function findGcfPrompt() {
            const { a, b } = {
                ...model.params,
            };
            return `Use the area model to determine the GCF of ${a} and ${b}.`;
        }
        function expressFractionPrompt() {
            const { a, b } = {
                ...model.params,
            };
            return `Express ${b} as a fraction of ${a}.`;
        }
        function check(model) {
            const { p, q } = model.params;
            const numerator = Number(
                model.ce.parse(model.input.get("fraction").tex, {
                    canonical: false,
                })._ops[0]._value
                /*model.ce
                    .box([
                        "Numerator",
                        JSON.parse(model.input.get("fraction").json),
                    ])
                    .toString()
                    */
            );
            const denominator = Number(
                model.ce.parse(model.input.get("fraction").tex, {
                    canonical: false,
                })._ops[1]._value
                /*
                model.ce
                    .box([
                        "Denominator",
                        JSON.parse(model.input.get("fraction").json),
                    ])
                    .toString()
                    */
            );

            return numerator === q && denominator === p;
            //WriteEquationOfProportionalRelationship.check(model) &&
            //ProportionalRelationshipTable.check(model)
        }
        return Object.assign(model, {
            check,
            expressFractionPrompt,
            findGcfPrompt,
        });
    });
}

function View(model, update) {
    const view = new Prompt.View(model, update);
    const areaModelContainer = dom("div", { style: "float: left;" }, []);
    function myDom() {
        const { a, b, x, y, xlab, ylab, showHint } = model.params;
        return view.wrap([
            dom("div", { class: "container" }, [
                model.findGcfPrompt(),
                dom("div", { class: "area-model-container" }, [
                    view.children.get("areaModel").rootElement,
                ]),
                model.expressFractionPrompt(),
                dom("div", {}, [
                    `$${b}$ is `,
                    new MathField.View(
                        {
                            ...model,
                            input: model.input.get(`fraction`),
                        },
                        function (message) {
                            model.input.set(`fraction`, message.value);
                            updateParent(message);
                        }
                    ).dom(),
                    ` of $${a}$.`,
                ]),
                dom("div", { class: "feedback-container" }, [
                    view.children.get("feedback").rootElement,
                ]),
                ...(model.paramsMap.get("printMode")
                    ? []
                    : [new SubmitButton.View(model, update).dom()]),
            ]),
        ]);
    }
    return Object.assign(view, {
        dom: myDom,
    });
}

function init(paramsMap, updateParentServices) {
    const rand = paramsMap.get("rand");
    const updateParent = updateParentServices.get("parent");
    return Promise.resolve(new Model(paramsMap)).then(function (model) {
        const view = new View(model, update);
        const updatePrompt = Prompt.updateFactory(
            model,
            view,
            updateParentServices
        );
        updateParentServices
            .get("ParamGenerator")({
                action: "generateParams",
                paramsSpec: paramsMap.get("promptParamsSpec"),
            })
            .then(function (params) {
                model.setParams(params);
            });
        function update(message) {
            if (message.action === "submit") {
                updatePrompt({
                    action: "updateChildren",
                    message: {
                        action: "getFeedback",
                        submitMessage: message,
                        data: message.data,
                        model: message.model,
                        update: updateParent,
                    },
                });
            } else if (message.action === "typeset") {
                return updateParentServices.get("MathJax")(message);
            }
            return Promise.resolve();
        }
        return updatePrompt({
            action: "initChildren",
            children: new Map([
                ["feedback", initFeedback],
                ["areaModel", initAreaModel],
            ]),
        }).then(function ([feedbackMVU, areaModelMVU]) {
            areaModelMVU.update({
                action: "setData",
                data: { a: model.params.a, b: model.params.b },
            });
            areaModelMVU.view.render();
            return { model, view, update };
        });
    });
}

export { init };
