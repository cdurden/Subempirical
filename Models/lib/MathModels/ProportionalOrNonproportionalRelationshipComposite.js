import * as MathField from "../MathField.js";
import * as SubmitButton from "../SubmitButton.js";
import * as FeedbackMessage from "../FeedbackMessage.js";
import { init as initFeedback } from "../../AutoCheckerFeedback.js";
import * as HtmlTapeDiagram from "../../HtmlTapeDiagramEquation.js";
import { init as initAreaModel } from "../../AreaModelSvg.js";
import { dom, zip, loadStylesheet } from "../../../lib/common.js";
import * as ProportionalRelationshipTable from "./ProportionalRelationshipTable.js";
import * as ProportionalOrNonproportionalRelationship from "./ProportionalOrNonproportionalRelationship.js";
import * as ProportionalOrNonproportionalRelationshipPrompt from "./ProportionalOrNonproportionalRelationshipPrompt.js";
import * as ProportionalOrNonproportionalGraph from "./ProportionalOrNonproportionalGraph.js";
import { init as initPropOrNonpropGraph } from "./ProportionalOrNonproportionalGraph.js";
import * as WriteEquationOfProportionalRelationship from "./WriteEquationOfProportionalRelationship.js";
import * as ScatterChart from "./ScatterChart.js";
import * as Prompt from "./Prompt.js";

function Model(paramsMap) {
    const rand = paramsMap.get("rand");
    return new Prompt.Model(paramsMap).then(function (model) {
        function prompt() {
            const { situation, detail } = {
                ...model.params,
            };
            return `${situation} ${detail ?? ""}`;
        }
        function check() {
            var eqnCheck;
            if (
                model.children
                    .get("propOrNonprop")
                    .input.get("isProportional") === "true"
            ) {
                eqnCheck = WriteEquationOfProportionalRelationship.check(model);
            } else {
                eqnCheck = true;
            }
            return (
                model.children.get("propOrNonprop").check() &&
                model.children.get("propOrNonpropGraph").check() &&
                ProportionalRelationshipTable.check(model) &&
                eqnCheck
            );
        }
        return Object.assign(model, { check, prompt });
    });
}

function View(model, update) {
    const view = new Prompt.View(model, update);
    const feedbackView = new FeedbackMessage.View(model, update);
    var scatterChartView;
    const tapeDiagramContainer = dom("div", { style: "float: left;" }, []);
    const areaModelContainer = dom("div", { style: "float: left;" }, []);
    view.showProportionalInputs = function () {};
    function myDom() {
        const { a, b, x, y, xlab, ylab, showHint } = model.params;
        const proportionalInputs = dom("div", { style: "display: flex;" }, [
            dom("div", { class: "container" }, [
                "e. ",
                WriteEquationOfProportionalRelationship.prompt(model, {
                    abbreviate: true,
                }),
                WriteEquationOfProportionalRelationship.inputDom(model, update),
            ]),
        ]);
        view.showProportionalInputs = function (show) {
            if (show) {
                proportionalInputs.style.display = "block";
            } else {
                proportionalInputs.style.display = "none";
            }
        };
        view.showProportionalInputs(
            model.children.get("propOrNonprop").input.get("isProportional") ===
                "true"
        );
        return view.wrap([
            dom("div", { class: "container" }, [
                dom("div", { class: "container" }, [model.prompt()]),
                showHint
                    ? dom(
                          "div",
                          {
                              class: "hint-container",
                          },
                          [
                              dom("b", {}, "Hint: "),
                              dom("div", { class: "area-model-container" }, [
                                  view.children.get("areaModel").rootElement,
                              ]),
                          ]
                      )
                    : [],
                dom("div", { style: "display: flex;" }, [
                    dom("div", { class: "container" }, [
                        "c. ",
                        ProportionalRelationshipTable.prompt(model, {
                            abbreviate: true,
                        }),
                        ProportionalRelationshipTable.inputDom(model, update),
                    ]),
                    dom("div", {}, [
                        dom(
                            "div",
                            { class: "container", style: "width: 500px;" },
                            ["d. ", scatterChartView?.dom()]
                        ),
                    ]),
                ]),
                dom("div", { class: "container" }, [
                    "a. ",
                    view.children.get("propOrNonprop").dom(),
                ]),
                dom("div", { style: "display: flex;", class: "container" }, [
                    "b. ",
                    view.children.get("propOrNonpropGraph").dom(),
                ]),
                proportionalInputs,
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
                if (message.name === "isProportional") {
                    view.showProportionalInputs(message.value === "true");
                }
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
        return ProportionalOrNonproportionalRelationship.init(
            paramsMap,
            new Map([...updateParentServices, ["parent", update]])
        ).then(function (propOrNonpropMVU) {
            model.setParams(propOrNonpropMVU.model.params);
            updatePrompt({
                action: "addChildren",
                children: new Map([["propOrNonprop", propOrNonpropMVU]]),
            });

            /*
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
            */
            return updatePrompt({
                action: "initChildren",
                children: new Map([
                    ["feedback", initFeedback],
                    ["areaModel", initAreaModel],
                    ["propOrNonpropGraph", initPropOrNonpropGraph],
                ]),
            }).then(function ([feedbackMVU, areaModelMVU, propOrNonPropMVU]) {
                areaModelMVU.update({
                    action: "setData",
                    data: { a: model.params.a, b: model.params.b },
                });
                propOrNonPropMVU.model.setParams(model.params);
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
    });
}

export { init };
