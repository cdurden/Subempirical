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
            return `${b} out of ${a} square units are shaded.`;
        }
        function expressFractionPrompt() {
            const { a, b } = {
                ...model.params,
            };
            return `Express ${b} as a fraction of ${a}.`;
        }
        function numerator() {
            return Number(
                model.ce.parse(model.input.get("fraction").tex, {
                    canonical: false,
                })._ops[0]._value
            );
        }

        function denominator() {
            return Number(
                model.ce.parse(model.input.get("fraction").tex, {
                    canonical: false,
                })._ops[1]._value
            );
        }
        function check() {
            const { p, q } = model.params;
            /*model.ce
                    .box([
                        "Numerator",
                        JSON.parse(model.input.get("fraction").json),
                    ])
                    .toString()
                    */
            /*
                model.ce
                    .box([
                        "Denominator",
                        JSON.parse(model.input.get("fraction").json),
                    ])
                    .toString()
                    */

            return model.numerator() === q && model.denominator() === p;
            //WriteEquationOfProportionalRelationship.check(model) &&
            //ProportionalRelationshipTable.check(model)
        }
        function fraction() {
            return `${model.numerator()}/${model.denominator()}`;
        }
        return Object.assign(model, {
            numerator,
            denominator,
            fraction,
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
                model.expressFractionPrompt(),
                dom("div", {}, [
                    `$${b}$ is `,
                    dom("div", { class: "inline-container" }, [
                        new MathField.View(
                            {
                                ...model,
                                input: model.input.get(`fraction`),
                            },
                            function (message) {
                                model.input.set(`fraction`, message.value);
                                update(message);
                            }
                        ).dom(),
                        dom("div", { class: "feedback-container" }, [
                            view.children.get("feedback").rootElement,
                        ]),
                    ]),
                    ` of $${a}$.`,
                ]),
                ...(model.paramsMap.get("printMode")
                    ? []
                    : [new SubmitButton.View(model, update).dom()]),
                dom("div", { class: "container" }, [
                    dom("h2", {}, ["Visualization"]),
                    model.findGcfPrompt(),
                    dom("div", { class: "area-model-container" }, [
                        view.children.get("areaModel").rootElement,
                    ]),
                ]),
            ]),
        ]);
    }
    return Object.assign(view, {
        dom: myDom,
    });
}

function init(paramsMap, services) {
    const rand = paramsMap.get("rand");
    const updateParent = services.get("parent");
    return Promise.resolve(new Model(paramsMap)).then(function (model) {
        const view = new View(model, update);
        const updatePrompt = Prompt.updateFactory(model, view, services);
        services
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
                    action: "updateChild",
                    childId: "feedback",
                    message: {
                        action: "getFeedback",
                        submitMessage: message,
                        data: message.data,
                        model: message.model,
                        update: function () {
                            services.get("parent")({
                                ...message,
                                data: model.fraction(),
                            });
                        },
                    },
                });
            } else if (message.action === "setInput") {
                if (
                    model.numerator() * Number(model.params.a) ===
                    model.denominator() * Number(model.params.b)
                ) {
                    updatePrompt({
                        action: "updateChild",
                        childId: "areaModel",
                        message: {
                            action: "setData",
                            data: { h: model.params.a / model.denominator() },
                        },
                    }).then(function () {
                        updatePrompt({
                            action: "updateChild",
                            childId: "areaModel",
                            message: {
                                action: "render",
                            },
                        });
                    });
                }
            } else if (message.action === "typeset") {
                return services.get("MathJax")(message);
                //} else {
                //    return services.get("parent")(message);
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
