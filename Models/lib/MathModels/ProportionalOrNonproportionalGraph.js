import * as MultipleChoiceSelector from "../MultipleChoiceSelector.js";
import * as SubmitButton from "../SubmitButton.js";
import * as FeedbackMessage from "../FeedbackMessage.js";
import { init as initFeedback } from "../../AutoCheckerFeedback.js";
import * as HtmlTapeDiagram from "../../HtmlTapeDiagramEquation.js";
import { init as initAreaModel } from "../../AreaModelSvg.js";
import { dom, zip, loadStylesheet } from "../../../lib/common.js";
import * as DoubleNumberLine from "./DoubleNumberLine.js";
import * as Prompt from "./Prompt.js";
import * as ProportionalOrNonproportionalRelationshipPrompt from "./ProportionalOrNonproportionalRelationshipPrompt.js";
import * as ScatterChart from "./ScatterChart.js";

function Model(paramsMap) {
    const rand = paramsMap.get("rand");
    return new Prompt.Model(paramsMap).then(function (model) {
        function prompt({ abbreviate }) {
            const shortPrompt =
                "What would the graph of this relationship look like?";
            const { situation, detail } = {
                ...model.params,
            };
            if (abbreviate) {
                return shortPrompt;
            } else {
                return `${situation} ${detail ?? ""} ${shortPrompt}`;
            }
        }
        function check() {
            return model.input.get("graphType") === model.params.graphType;
        }
        return Object.assign(model, { check, prompt });
    });
}

function View(model, update) {
    const view = new Prompt.View(model, update);
    const feedbackView = new FeedbackMessage.View(model, update);
    var scatterChartView;
    /*
    const feedbackDom = dom("div", { class: "feedback-container" }, [
        feedbackView.dom(),
    ]);
    */
    const tapeDiagramContainer = dom("div", { style: "float: left;" }, []);
    /*
    HtmlTapeDiagram.init(
        new Map([
            ...Array.from(model.paramsMap.entries()),
            ["xlab", model.params.xlab],
            ["ylab", model.params.ylab],
        ]),
        update
    ).then(function (tapeDiagramMVU) {
        tapeDiagramContainer.append(tapeDiagramMVU.view.dom());
    });
    */
    const areaModelContainer = dom("div", { style: "float: left;" }, []);
    /*
    function renderFeedback(correct) {
        model.correct = correct;
        feedbackView.setVisible(true);
        feedbackDom.replaceChildren(feedbackView.dom());
    }
    */
    function myDom(options) {
        const { a, b, x, y, xlab, ylab, showHint } = model.params;
        return view.wrap([
            dom("div", { class: "container" }, [
                model.prompt({ abbreviate: true, ...options }),
                new MultipleChoiceSelector.View(
                    {
                        name: "graphType",
                        choices: [
                            {
                                value: "A",
                                label: [
                                    dom("img", {
                                        src:
                                            "./Models/lib/MathModels/images/ProportionalOrNonproportionalGraphA.png",
                                    }),
                                ],
                            },
                            {
                                value: "B",
                                label: [
                                    dom("img", {
                                        src:
                                            "./Models/lib/MathModels/images/ProportionalOrNonproportionalGraphB.png",
                                    }),
                                ],
                            },
                            {
                                value: "C",
                                label: [
                                    dom("img", {
                                        src:
                                            "./Models/lib/MathModels/images/ProportionalOrNonproportionalGraphC.png",
                                    }),
                                ],
                            },
                        ],
                        value: model.input.get("graphType"),
                    },
                    function (message) {
                        model.input.set(message.name, message.value);
                        //updateParent(message);
                    }
                ).dom(),
                /*
                dom("div", { class: "feedback-container" }, [
                    view.children.get("feedback").rootElement,
                ]),
                ...(model.paramsMap.get("printMode")
                    ? []
                    : [new SubmitButton.View(model, update).dom()]),
                */
            ]),
        ]);
    }
    function addScatterChartView(newScatterChartView) {
        scatterChartView = newScatterChartView;
    }
    return Object.assign(view, {
        dom: myDom,
        //renderFeedback,
        addScatterChartView,
    });
}
function scatterData(model) {
    const x = model.params.x;
    const y = model.params.y;
    const data = { tableData: [], eqnData: [] };
    for (let i = 0; i < x.length; i++) {
        data.tableData.push({
            x: x[i],
            y: Number(y[i] ?? model.input.get(`y_${i}`)?.json),
        });
    }
    [Math.min(0, ...x), Math.max(...x)].forEach(function (x_i) {
        const { xvar, xlab, yvar, ylab } = model.params;
        model.ce.pushScope();
        model.ce.declare(yvar ?? ylab?.[0] ?? "y", {
            domain: "RealNumbers",
        });
        model.ce.declare(xvar ?? xlab?.[0] ?? "x", {
            domain: "RealNumbers",
            value: x_i,
        });
        model.ce.assign(xvar ?? xlab?.[0] ?? "x", x_i);
        const y_i = model.ce
            .box(JSON.parse(model.input.get("eqn_rhs")?.json ?? "0"))
            .N();
        data.eqnData.push({
            x: x_i,
            y: Number(y_i.toString()),
        });
        model.ce.popScope();
    });
    return data;
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
                model.setParams({
                    ...params,
                    ...ProportionalOrNonproportionalRelationshipPrompt.randPrompt(
                        rand,
                        params
                    ),
                });
            });

        /*
            init(
                paramsMap,
                new Map([...updateParentServices, ["parent", function () {}]])
            ).then(function (feedbackMVU) {
                updatePrompt({
                    action: "addChild",
                    childId: "feedback",
                    child: feedbackMVU,
                });
            });
        AreaModel.init(
            paramsMap,
            new Map([...updateParentServices, ["parent", function () {}]])
        ).then(function (areaModelMVU) {
            updatePrompt({
                action: "addChild",
                childId: "areaModel",
                child: areaModelMVU,
            });
        });
        */
        const updateScatterCharts = [];
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
                //updateParent(message);
            } else if (message.action === "setInput") {
                updateScatterCharts.forEach(function (updateScatterChart) {
                    updateScatterChart({
                        action: "setData",
                        data: scatterData(model),
                    });
                });
            } else if (message.action === "typeset") {
                updateParentServices.get("MathJax")(message);
                /*
            } else if (message.action === "setParams") {
                updatePrompt(message).then(function () {
                    model.updatePrompt();
                    updatePrompt({ action: "render" });
                });
            } else if (message.action === "renderTask") {
                updatePrompt(message);
                */
            }
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
                data: { a: model.params.x[0], b: model.params.y[0] },
            });
            areaModelMVU.view.render();
            ScatterChart.init(paramsMap, update).then(function (
                scatterChartMVU
            ) {
                view.addScatterChartView(scatterChartMVU.view);
                updateScatterCharts.push(scatterChartMVU.update);
                view.render();
            });
            return { model, view, update };
        });
    });
}

export { init, View };
