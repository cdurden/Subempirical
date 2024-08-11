import * as MathField from "../MathField.js";
import * as SubmitButton from "../SubmitButton.js";
import * as FeedbackMessage from "../FeedbackMessage.js";
import { init as initTexSvg } from "../../TexSvg.js";
import { init as initFeedback } from "../../AutoCheckerFeedback.js";
import { init as initDragToSvg } from "../../DragToSvg.js";
import { dom, loadResource, range } from "../../../lib/common.js";
import * as Prompt from "./Prompt.js";

function Model(paramsMap, ce) {
    return new Prompt.Model(paramsMap).then(function (model) {
        Object.setPrototypeOf(model, Model.prototype);
        const rand = paramsMap.get("rand");
        const params = {};
        const input = new Map();
        function parse(jsonMath) {
            if (!(jsonMath instanceof Array)) {
                const tex = jsonMath;
                return [{ json: jsonMath, tex }];
            } else {
                const [op, n, expr] = jsonMath;
                const tex = new Map([
                    [
                        "Multiply",
                        `\\displaylines{\\text{Multiply}\\\\ \\text{by} ~${n}}`,
                    ],
                    ["Divide", `\\text{Divide by }${n}`],
                    ["Add", `\\text{Add }${n}`],
                    ["Subtract", `\\text{Subtract }${n}`],
                ]).get(op);
                return [{ json: [op, n], tex }, ...parse(expr)];
            }
        }
        model.data = parse(paramsMap.get("jsonMath"));
        function expr(jsonMath = paramsMap.get("jsonMath")) {
            return ce.box(paramsMap.get("jsonMath"));
        }
        function latexExpr(jsonMath = paramsMap.get("jsonMath")) {
            return expr(jsonMath).latex;
        }
        function buildMathJsonFromInput() {
            model.input.get;
        }
        function check() {
            return expr().isEqual(ce.box(model.input));
        }
        function setInput(newInput) {
            model.input = newInput;
        }
        return Object.assign(model, {
            paramsMap,
            params,
            check,
            prompt,
            latexExpr,
            input,
            setInput,
            parse,
        });
    });
}

function View(model, update) {
    const view = new Prompt.View(model, update);
    Object.setPrototypeOf(view, View.prototype);
    const feedbackView = new FeedbackMessage.View(model, update);
    const targetContainer = dom("div", { class: "container" }, []);
    function addTarget(target) {
        targetContainer.appendChild(target.rootElement);
    }
    function myDom() {
        const { a, b, x, y, xlab, ylab, showHint } = model.params;
        return dom("div", { class: "container" }, [
            dom(
                "div",
                { class: "container" },
                `Build a flowchart to show the story of x in the expression \\( ${model.latexExpr()} \\)`
            ),
            targetContainer,
            dom("div", { class: "feedback-container" }, [
                view.children.get("feedback").rootElement,
            ]),
            ...(model.paramsMap.get("printMode")
                ? []
                : [new SubmitButton.View(model, update).dom()]),
        ]);
    }
    /*
    function render() {
        rootElement.appendChild(myDom());
        return Promise.resolve(view);
    }
    */
    return Object.assign(view, {
        dom: myDom,
        addTarget,
    });
}

function init(paramsMap, updateParentServices) {
    const rand = paramsMap.get("rand");
    const updateParent = updateParentServices.get("parent");
    return Promise.all([loadResource("CortexJS-Compute-Engine")]).then(
        function ([cortexJsComputeEngineModule]) {
            const ce = new cortexJsComputeEngineModule.ComputeEngine();
            const jsonMath = ["Add", 4, ["Multiply", 2, "x"]];
            return Promise.resolve(
                new Model(new Map([...paramsMap, ["jsonMath", jsonMath]]), ce)
            ).then(function (model) {
                const view = new View(model, update);
                const updatePrompt = Prompt.updateFactory(
                    model,
                    view,
                    updateParentServices
                );
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
                    } else if (message.action === "setInput") {
                        model.setInput(
                            Array.from(message.model.spaces.entries())
                                .map(function ([spaceId, space]) {
                                    return space.content[0]?.paramsMap.get(
                                        "json"
                                    );
                                })
                                .reduce(function (acc, json) {
                                    return [...(json ?? []), acc];
                                })
                        );
                    } else if (message.action === "typeset") {
                        return updateParentServices.get("MathJax")(message);
                    }
                }
                return initDragToSvg(
                    paramsMap,
                    new Map([...updateParentServices, ["parent", update]])
                ).then(function (dragToSvgMVU) {
                    //view.addTarget(dragToSvgMVU.view);
                    const ops = model.parse(model.paramsMap.get("jsonMath"));
                    return initTexSvg(
                        new Map([
                            [
                                "tex",
                                range(0, ops.length)
                                    .map(function (i) {
                                        return `\\omspace{${i}}`;
                                    })
                                    .reduce(function (acc, space) {
                                        return `${acc} \\rightarrow ${space}`;
                                    }),
                            ],
                        ]),
                        new Map([
                            ...Array.from(updateParentServices),
                            ["parent", update],
                        ])
                    ).then(function (texSvgMVU) {
                        updateParentServices.get("loader")({
                            action: "addEventListener",
                            eventName: "mounted",
                            listener: function () {
                                return texSvgMVU.view
                                    .render()
                                    .then(function () {
                                        dragToSvgMVU.view.addTarget(
                                            texSvgMVU.view.rootElement.querySelector(
                                                "svg"
                                            )
                                        );
                                        ops.map(function (op, i) {
                                            return initTexSvg(
                                                new Map([
                                                    [
                                                        "svgRoot",
                                                        dragToSvgMVU.view.draw
                                                            .node,
                                                    ],
                                                    [
                                                        "drawContext",
                                                        dragToSvgMVU.view.draw,
                                                    ],
                                                    ["tileId", i],
                                                    ["tex", op.tex],
                                                    ["json", op.json],
                                                    [
                                                        "scale",
                                                        dragToSvgMVU.view.scale,
                                                    ],
                                                ]),
                                                new Map([
                                                    ...Array.from(
                                                        updateParentServices
                                                    ),
                                                    ["parent", update],
                                                ])
                                            ).then(function (tileMVU) {
                                                view.rootElement.appendChild(
                                                    tileMVU.view.rootElement
                                                );
                                                tileMVU.view.hide();
                                                return tileMVU.view
                                                    .render()
                                                    .then(function () {
                                                        return dragToSvgMVU.update(
                                                            {
                                                                action:
                                                                    "addTile",
                                                                tileValue:
                                                                    op.json,
                                                                tileMVU,
                                                            }
                                                        );
                                                    });
                                            });
                                        });
                                    });
                            },
                        });
                        view.addTarget(texSvgMVU.view);
                        return updatePrompt({
                            action: "initChildren",
                            children: new Map([["feedback", initFeedback]]),
                        }).then(function ([feedbackMVU]) {
                            return { model, view, update };
                        });
                    });
                });
            });
        }
    );
}

export { init };
