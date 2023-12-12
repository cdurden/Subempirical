import {
    any,
    all,
    dom,
    getFile,
    mapReplacer,
    loadScript,
    loadResource,
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
function Model(paramsMap) {
    const self = Object.create(null);

    Object.setPrototypeOf(self, Model.prototype);
    const data = {
        tapes: new Map([
            ["a", [{ label: "x", size: 4 }]],
            ["b", [{ label: "10", size: 10 }]],
        ]),
    };
    function setSectorLabel(label) {
        data.sectorLabel = label;
    }
    function setData(newData) {
        Object.assign(data, newData);
        updateWidth();
    }
    function setHeight(h) {
        self.data.h = h;
        updateWidth();
    }
    function updateWidth() {
        const { a, b, h } = self.data;
        self.data.w = Math.ceil(Math.max(a, b) / h);
    }
    function getHeight() {
        return self.data.h;
    }
    function increaseHeight() {
        setHeight(
            Math.min(Math.max(self.data.a, self.data.b), getHeight() + 1)
        );
    }
    function decreaseHeight() {
        setHeight(Math.max(getHeight() - 1, 1));
    }
    return new Promise(function (resolve) {
        resolve(
            Object.assign(self, {
                data,
                setData,
                setSectorLabel,
                setHeight,
                paramsMap,
                increaseHeight,
                decreaseHeight,
            })
        );
    });
}

function View(model, update) {
    const self = Object.create(null);
    const rootElement = document.createElement("div");
    Object.setPrototypeOf(self, View.prototype);
    const scale = 50;
    var d = gcf(model.data.a, model.data.b);
    function drawBox(group, x, y, l, w, fill = "none") {
        const drawing = group.rect(l * scale, w * scale).attr({
            stroke: "black",
            "fill-opacity": 100,
            fill,
            x: x * scale,
            y: y * scale,
            cursor: "pointer",
        });
        return drawing;
    }
    function drawText(group, x, y, text) {
        const drawing = group.text(text).attr({
            x: x * scale,
            y: y * scale,
            "font-size": "36pt",
            "text-anchor": "middle",
        });
        return drawing;
    }
    function render() {
        return new Promise(function (resolve) {
            rootElement.replaceChildren();
            const viewContainerElmt = document.createElement("div");
            rootElement.appendChild(viewContainerElmt);
            const nSectors = model.data.nSectors;
            const width =
                Math.ceil(Math.max(model.data.a, model.data.b) / model.data.h) +
                2;
            const height = model.data.h + 2;
            const boundingRect = {
                x: 0,
                y: 0,
                height: height * scale,
                width: width * scale,
            };
            /*
            const gcfControl = new MathField.View(model, function (message) {
                model.setHeight(Number(JSON.parse(message.value.json)));
                render();
            }).dom();
            rootElement.append(gcfControl);
            */
            const draw = SVG()
                .addTo(rootElement)
                .size(width * scale, height * scale)
                .viewbox(boundingRect);
            const svg = draw.node;
            const pt = svg.createSVGPoint();

            const [grid1, grid2] = [model.data.a, model.data.b]
                .sort(function (a, b) {
                    return b - a;
                })
                .map(function (x, i) {
                    return drawGrid(
                        draw,
                        1,
                        1.5,
                        x,
                        Math.ceil(x / model.data.h),
                        model.data.h,
                        i > 0 ? "grey" : "white"
                    );
                });
            const heightLabel = drawText(
                draw,
                0.5,
                1.5 + model.data.h / 2,
                `${model.data.h}`
            );
            const widthLabel = drawText(
                draw,
                1 + model.data.w / 2,
                1,
                `${model.data.w}`
            );
            const upControl = drawText(draw, 0.5, 1 + model.data.h / 2, "⌃");
            upControl.node.style.cursor = "pointer";
            upControl.node.addEventListener("click", function (event) {
                update({ action: "increaseHeight" });
            });
            const downControl = drawText(draw, 0.5, 2 + model.data.h / 2, "⌄");
            downControl.node.addEventListener("click", function (event) {
                update({ action: "decreaseHeight" });
            });
            downControl.node.style.cursor = "pointer";
            resolve(self);
        });
    }
    return Object.assign(self, {
        rootElement,
        render,
        modalView: undefined,
    });
}
function init(paramsMap, updateParentServices) {
    const updateParent = updateParentServices.get("parent");
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
            view.render();
            var modalUpdate;
            function update(message) {
                if (message.action === "setSectorLabel") {
                    model.setSectorLabel(message.label);
                    view.render();
                    modalUpdate({ action: "hide" });
                } else if (message.action === "setData") {
                    model.setData(message.data);
                } else if (message.action === "increaseHeight") {
                    model.increaseHeight();
                    view.render();
                } else if (message.action === "decreaseHeight") {
                    model.decreaseHeight();
                    view.render();
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
