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
    const mathFields = new Map(
        Array.from(model.quantities.entries()).map(function ([name, value]) {
            return [
                name,
                new MathField.View(
                    { ...model, input: value },
                    function (message) {
                        model.setQuantity(name, message.value);
                        render();
                    }
                ),
            ];
        })
    );
    function myDom() {
        const { a, b, d, divs, lcd, sectorLabel, xlab, ylab } = model.data;
        loadStylesheet("./Models/lib/MathModels/styles/math-prompt.css");
        //rootElement.append(ratioControl);
        // Draw circles
        const sector = function () {
            return dom(
                "div",
                {},
                [
                    new MathField.View(
                        {
                            ...model,
                            input: model.ce.box(JSON.parse(sectorLabel)).latex,
                        },
                        function (message) {
                            model.setSectorLabel(message.value.json);
                            mathViewFields.forEach(function (mathViewField) {
                                mathViewField.setValue(message.value.tex, {
                                    suppressChangeNotifications: true,
                                });
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
        const diagram = dom("table", { class: "tape-diagram" }, [
            ...Array.from(model.quantities.entries()).reduce(function (
                acc,
                [name, value]
            ) {
                const N = model.ce.box(["Numerator", JSON.parse(value.json)])
                    ._value;
                const D = model.ce.box(["Denominator", JSON.parse(value.json)])
                    ._value;
                const a = N / D;
                return [
                    ...acc,
                    dom("tr", {}, [
                        dom("td", { colspan: 2 }),
                        dom(
                            "th",
                            {
                                colspan: (N / d / (D / lcd)) * divs,
                                style: "text-align: center;",
                                class: "label",
                            },
                            [(N / d / (D / lcd)) * divs]
                        ),
                    ]),
                    dom("tr", {}, [
                        dom(
                            "th",
                            {
                                //rowspan: d / lcd / divs,
                                style: "text-align: center;",
                                class: "label",
                            },
                            [mathFields.get(name).dom()]
                        ),
                        dom("td", {}, [
                            `$${
                                model.ce.box([
                                    "Divide",
                                    ["Divide", d, lcd],
                                    divs,
                                ]).latex
                            }$`,
                        ]),
                        ...range(0, (N / d / (D / lcd)) * divs).map(function (
                            i
                        ) {
                            return dom("td", {
                                class:
                                    i < (N / d / (D / lcd)) * divs
                                        ? "sector"
                                        : "empty",
                            });
                        }),
                    ]),
                ];
            },
            []),
        ]);
        const increaseDivisionsButton = dom("button", {}, "+");
        increaseDivisionsButton.addEventListener("click", function (e) {
            model.increaseDivisions();
            render();
        });
        const decreaseDivisionsButton = dom("button", {}, "-");
        decreaseDivisionsButton.addEventListener("click", function (e) {
            model.decreaseDivisions();
            render();
        });
        const container = dom("div", {}, [
            dom("div", {}, [
                //...mathFieldsDom,
                dom("br", {}, []),
                ...(model.paramsMap.get("printMode") ? [] : [diagram]),
            ]),
            dom("div", {}, [increaseDivisionsButton, decreaseDivisionsButton]),
        ]);
        rootElement.replaceChildren();
        rootElement.append(container);
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
    const ComputeEngine = paramsMap.get("cortexJsComputeEngine");
    const ce = new ComputeEngine();
    const quantities = new Map([
        ["a", { json: "1", tex: 1 }],
        ["b", { json: "1", tex: 1 }],
    ]);
    function setQuantity(name, value) {
        quantities.set(name, value);
        const [d, lcd] = Array.from(quantities.entries()).reduce(function (
            [nameA, valueA],
            [nameB, valueB]
        ) {
            const a = ce.box(["Numerator", JSON.parse(valueA.json)])._value;
            const b = ce.box(["Numerator", JSON.parse(valueB.json)])._value;
            const d = gcf(a, b);
            const Da = ce.box(["Denominator", JSON.parse(valueA.json)])._value;
            const Db = ce.box(["Denominator", JSON.parse(valueB.json)])._value;
            return [gcf(a, b), (Da * Db) / gcf(Da, Db)];
        });
        data.d = d;
        data.lcd = lcd;
    }

    Object.setPrototypeOf(self, Model.prototype);
    const data = {
        d: 1,
        lcd: 1,
        divs: 1,
        xlab: paramsMap.get("xlab"),
        ylab: paramsMap.get("ylab"),
        nSectors: 8,
        maxRating: 10,
        sectorLabel: "1",
        ratings: [0, 0, 0, 0, 0, 0, 0, 0],
    };
    function increaseDivisions() {
        data.divs = data.divs + 1;
    }
    function decreaseDivisions() {
        data.divs = Math.max(1, data.divs - 1);
    }
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
    return new Promise(function (resolve) {
        resolve(
            Object.assign(self, {
                data,
                exportModel,
                setSectorLabel,
                ce,
                setQuantity,
                quantities,
                paramsMap,
                increaseDivisions,
                decreaseDivisions,
            })
        );
    });
}

function init(paramsMap, updateParentServices) {
    const updateParent = updateParentServices.get("parent");
    return Promise.all([
        loadResource("Mathlive"),
        loadResource("CortexJS-Compute-Engine"),
    ]).then(function ([mathLiveModule, cortexJsComputeEngineModule]) {
        return new Model(
            new Map([
                ...Array.from(paramsMap.entries()),
                [
                    "cortexJsComputeEngine",
                    cortexJsComputeEngineModule.ComputeEngine,
                ],
            ])
        ).then(function (model) {
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
