import * as MathField from "../MathField.js";
import * as SubmitButton from "../SubmitButton.js";
import * as FeedbackMessage from "../FeedbackMessage.js";
import { init as initFeedback } from "../../AutoCheckerFeedback.js";
import * as HtmlTapeDiagram from "../../HtmlTapeDiagramEquation.js";
import { init as initAreaModel } from "../../AreaModelSvg.js";
import { dom, zip, loadStylesheet } from "../../../lib/common.js";
import * as ProportionalRelationshipTable from "./ProportionalRelationshipTable.js";
import * as WriteEquationOfProportionalRelationship from "./WriteEquationOfProportionalRelationship.js";
import * as DoubleNumberLine from "./DoubleNumberLine.js";
import * as Prompt from "./Prompt.js";
import * as ProportionalRelationshipPrompt from "./ProportionalRelationshipPrompt.js";
import * as ScatterChart from "./ScatterChart.js";

function Model(paramsMap) {
    const rand = paramsMap.get("rand");
    return new Prompt.Model(paramsMap).then(function (model) {
        function prompt() {
            const { situation, detail } = {
                ...model.params,
            };
            return `${situation} ${detail ?? ""}`;
        }
        function check(model) {
            return (
                WriteEquationOfProportionalRelationship.check(model) &&
                ProportionalRelationshipTable.check(model)
            );
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
    function myDom() {
        const { a, b, x, y, xlab, ylab, showHint } = model.params;
        return view.wrap([
            dom("div", { class: "container" }, [
                model.prompt(),
                showHint
                    ? dom(
                          "div",
                          {
                              class: "hint-container",
                          },
                          [
                              dom("b", {}, "Hint: "),
                              `What is the GCF of ${x[0]} and ${y[0]}? Set the height of the area model to the GCF and use it express one number as a fraction of the other.`,
                              dom("div", { class: "area-model-container" }, [
                                  view.children.get("areaModel").rootElement,
                              ]),
                          ]
                      )
                    : [],
                dom("div", { style: "display: flex;" }, [
                    dom("div", { class: "container" }, [
                        "a. ",
                        ProportionalRelationshipTable.prompt(model, {
                            abbreviate: true,
                        }),
                        ProportionalRelationshipTable.inputDom(model, update),
                    ]),
                    dom("div", {}, [
                        dom("div", { class: "container" }, [
                            "b. ",
                            WriteEquationOfProportionalRelationship.prompt(
                                model,
                                {
                                    abbreviate: true,
                                }
                            ),
                            WriteEquationOfProportionalRelationship.inputDom(
                                model,
                                update
                            ),
                        ]),
                        dom("div", { class: "container" }, [
                            "c. ",
                            scatterChartView?.dom(),
                        ]),
                        /*
                dom("div", {}, [
                    "b. ",
                    DoubleNumberLine.prompt(model, { abbreviate: true }),
                ]),
                */
                    ]),
                ]),
                //tapeDiagramContainer,
                //feedbackDom,
                dom("div", { class: "feedback-container" }, [
                    view.children.get("feedback").rootElement,
                ]),
                ...(model.paramsMap.get("printMode")
                    ? []
                    : [new SubmitButton.View(model, update).dom()]),
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
                    ...ProportionalRelationshipPrompt.randPrompt(rand, params),
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
            action: "addChildren",
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
            });
            return { model, view, update };
        });
    });
}

export { init };
