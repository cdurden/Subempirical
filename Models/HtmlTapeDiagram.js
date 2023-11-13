import {
    any,
    range,
    all,
    dom,
    getFile,
    mapReplacer,
    loadScript,
    loadResource,
    loadStylesheet,
    composeUpdateThenRender,
} from "../lib/common.js";
import * as MathField from "./lib/MathField.js";

import { init as initModal } from "./Modal.js";

function gcf(n, m) {
    const a = Math.max(n, m);
    const b = Math.min(n, m);
    if (a % b === 0) {
        return b;
    } else {
        return gcf(a % b, b);
    }
}
function View(model, update) {
    const self = Object.create(null);
    const rootElement = document.createElement("div");
    Object.setPrototypeOf(self, View.prototype);
    //var d = gcf(a, b);
    function myDom() {
        const { a, b, d, sectorLabel, xlab, ylab } = model.data;
        loadStylesheet("./Models/lib/MathModels/styles/math-prompt.css");
        const ratioControl = new MathField.View(
            { input: b === 1 ? a : `\\frac{${a}}{${b}}` },
            function (message) {
                const parsedValue = model.ce.box(
                    JSON.parse(message.value.json)
                );
                if (
                    model.setRatio(parsedValue?._value) &&
                    (parsedValue?._value instanceof Array ||
                        message.value.tex.match("frac") === null)
                ) {
                    render();
                    //update({ message: "render" });
                }
            }
        ).dom();
        ratioControl.setAttribute("default-mode", "inline-math");
        ratioControl.setAttribute("style", 'display: "inline-block"');
        //rootElement.append(ratioControl);
        const mathViewFields = [];
        // Draw circles
        const sector = function () {
            return dom(
                "div",
                {},
                [
                    new MathField.View(
                        {
                            input: model.ce.box(JSON.parse(sectorLabel)).latex,
                        },
                        function (message) {
                            model.setSectorLabel(message.value.json);
                            mathViewFields.forEach(function (mathViewField) {
                                mathViewField.setValue(message.value.tex);
                            });
                        }
                    ).dom(),
                ].map(function (mathViewField) {
                    mathViewField.addEventListener("change", function () {
                        render();
                    });
                    mathViewFields.push(mathViewField);
                    return mathViewField;
                })
            );
        };
        const aTotal = model.ce.box([
            "Multiply",
            JSON.parse(model.data.sectorLabel),
            a,
        ]);
        const bTotal = model.ce.box([
            "Multiply",
            JSON.parse(model.data.sectorLabel),
            b,
        ]);
        const diagram = dom("div", {}, [
            dom("b", {}, ["Fill in the blank: "]),
            `The amount of ${ylab} is `,
            ratioControl,
            ` times the amount of ${xlab}.`,
            dom("table", { class: "tape-diagram" }, [
                dom("tr", {}, [
                    dom("th", {}, []),
                    dom(
                        "td",
                        {
                            colspan: a,
                            style: "text-align: center;",
                            class: "label",
                        },
                        [`$${aTotal.latex}$`]
                    ),
                ]),
                dom("tr", {}, [
                    dom("th", {}, [ylab]),
                    ...range(0, a / d).map(function (i) {
                        return dom(
                            "td",
                            { class: i < a ? "sector" : "empty" },
                            i < a ? [sector()] : []
                        );
                    }),
                ]),
                dom("tr", {}, [dom("td", { style: "height: 0.5em;" }, [])]),
                dom("tr", {}, [
                    dom("th", {}, [xlab]),
                    ...range(0, b / d).map(function (i) {
                        return dom(
                            "td",
                            { class: i < b ? "sector" : "empty" },
                            i < b ? [sector()] : []
                        );
                    }),
                ]),
                dom("tr", {}, [
                    dom("th", {}, []),
                    dom(
                        "td",
                        {
                            colspan: b,
                            style: "text-align: center;",
                            class: "label",
                        },
                        [`$${bTotal.latex}$`]
                    ),
                ]),
            ]),
        ]);
        rootElement.replaceChildren();
        rootElement.append(diagram);
        update({ action: "typeset", element: rootElement });
        return rootElement;
    }

    function render() {
        return myDom();
    }
    return Object.assign(self, {
        rootElement,
        render,
        modalView: undefined,
        dom: myDom,
    });
}
function Model(paramsMap) {
    const self = Object.create(null);
    const ce = new ComputeEngine.ComputeEngine();

    Object.setPrototypeOf(self, Model.prototype);
    const data = {
        a: 1,
        b: 1,
        d: 1,
        xlab: paramsMap.get("xlab"),
        ylab: paramsMap.get("ylab"),
        nSectors: 8,
        maxRating: 10,
        sectorLabel: "1",
        ratings: [0, 0, 0, 0, 0, 0, 0, 0],
    };
    function setSectorLabel(label) {
        data.sectorLabel = label;
    }
    function exportModel() {
        const blob = new Blob([JSON.stringify(data, mapReplacer)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.setAttribute("href", url);
        anchor.setAttribute("download", `model.json`);
        const clickHandler = function () {
            setTimeout(function () {
                URL.revokeObjectURL(url);
                anchor.removeEventListener("click", clickHandler);
            }, 150);
        };
        anchor.addEventListener("click", clickHandler, false);
        anchor.click();
    }
    function setRatio(value) {
        if (value instanceof Array) {
            self.data.a = value[0];
            self.data.b = value[1];
            self.data.d = gcf(self.data.a, self.data.b);
            return true;
        } else if (value !== undefined) {
            self.data.a = value;
            self.data.b = 1;
            self.data.d = 1;
            return true;
        }
        return false;
    }
    return new Promise(function (resolve) {
        resolve(
            Object.assign(self, {
                data,
                exportModel,
                setSectorLabel,
                ce,
                setRatio,
            })
        );
    });
}

function init(paramsMap, updateParent) {
    const scriptSourceMap = new Map([
        ["localhost", ["../node_modules/@svgdotjs/svg.js/dist/svg.js"]],
        ["other", ["https://unpkg.com/@svgdotjs/svg.js@3.2.0/dist/svg.js"]],
    ]);
    const hostname = window.location.hostname;
    const scriptSource = scriptSourceMap.has(hostname) ? hostname : "other";
    return Promise.all([
        ...scriptSourceMap.get(scriptSource).map(function (script) {
            return loadScript(script);
        }),
        loadResource("Mathlive"),
        loadResource("CortexJS-Compute-Engine"),
    ]).then(function () {
        return new Model(paramsMap).then(function (model) {
            const view = new View(model, update);
            var modalUpdate;
            function update(message) {
                if (message.action === "setSectorLabel") {
                    model.setSectorLabel(message.label);
                    updateParent({ message: "render" });
                    modalUpdate({ action: "hide" });
                } else if (message.action === "editSectorLabel") {
                    modalUpdate({
                        action: "updateModal",
                        modalSpec: {
                            header: "Set label",
                            //sector,
                            body: `<input type='text' id='sectorLabelInput', value=${model.data.sectorLabel}>`,
                            onSubmit: function () {
                                const label = document.getElementById(
                                    "sectorLabelInput"
                                ).value;
                                update(
                                    {
                                        action: "setSectorLabel",
                                        sector: message.sector,
                                        label,
                                    },
                                    model
                                );
                            },
                        },
                    });
                    modalUpdate({ action: "show" });
                    //view.render();
                } else if (message.action === "render") {
                    view.render();
                } else if (message.action === "setModal") {
                    view.modalView = message.modalView;
                    modalUpdate = message.modalUpdate;
                } else if (message.action === "loadSubmissions") {
                    model.data = JSON.parse(message.submissions.pop()[4]);
                    view.render();
                }
                updateParent(message);
                return Promise.resolve(message);
            }
            updateParent({ action: "getSubmissions", update });
            return initModal(new Map(), update).then(function (modalMVU) {
                update({
                    action: "setModal",
                    modalUpdate: modalMVU.update,
                    modalView: modalMVU.view,
                });
                return {
                    model,
                    view,
                    update,
                };
            });
        });
    });
}

export { init };
