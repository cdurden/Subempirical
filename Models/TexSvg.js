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

// MathJax-related utility functions
function insertMath(tex, container) {
    const mathJaxElement = document.createElement("div");
    mathJaxElement.style["font-size"] = "48pt";
    mathJaxElement.innerHTML = `\\(${tex}\\)`;
    container.appendChild(mathJaxElement);
    return mathJaxElement;
}
function Model(paramsMap) {
    const self = Object.create(null);

    Object.setPrototypeOf(self, Model.prototype);
    const data = {
        tex: paramsMap.get("tex"),
    };
    function setTex(tex) {
        data.tex = tex;
    }
    function setData(newData) {
        Object.assign(data, newData);
        updateWidth();
    }
    function setHeight(h) {
        self.data.h = h;
    }
    function setWidth(w) {
        self.data.w = w;
    }
    function getHeight() {
        return 1;
    }
    function getWidth() {
        return 1;
    }
    return new Promise(function (resolve) {
        resolve(
            Object.assign(self, {
                data,
                setData,
                setTex,
                setHeight,
                setWidth,
                getWidth,
                getHeight,
                paramsMap,
            })
        );
    });
}

function View(model, update) {
    const view = Object.create(null);
    const rootElement = document.createElement("div");
    Object.setPrototypeOf(view, View.prototype);
    var scale = 50;
    var transform;
    //svgElmt.setAttribute("data-tile-index", index);
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
    function setScale(newScale) {
        scale = newScale;
    }
    function drawGrid(group, x, y, l, h, fill = "none") {
        var drawing;
        for (let i = 0; i < l; i++) {
            for (let j = 0; j < h; j++) {
                drawing = drawBox(group, x + i, y + j, 1, 1, fill);
            }
        }
        return group;
    }
    function render() {
        return update({
            action: "typeset",
            element: insertMath(model.data.tex, rootElement),
        }).then(function () {
            return new Promise(function (resolve) {
                view.svgElmt = rootElement.querySelector("svg");
                transform = view.svgElmt.getScreenCTM().inverse();
                transform.e = transform.f = 0;
                const bbox = view.svgElmt.getBBox();
                view.svgElmt.classList.add("draggable");
                resolve(view);
            });
        });
    }
    function show() {}
    function hide() {
        view.rootElement.style.display = "none";
    }
    function clone() {}
    function move(x, y) {
        view.x = x;
        view.y = y;
        const dA = new DOMPoint(x, y);
        const dB = dA.matrixTransform(transform);
        // translate the element
        view.svgElmt.transform.baseVal.getItem(0).setTranslate(dB.x, dB.y);
    }
    return Object.assign(view, {
        rootElement,
        render,
        modalView: undefined,
        show,
        hide,
        move,
        clone,
        setScale,
    });
}
function init(paramsMap, updateParentServices) {
    const updateParent = updateParentServices.get("parent");
    return Promise.all([
        loadResource("Mathlive"),
        loadResource("CortexJS-Compute-Engine"),
    ]).then(function () {
        return new Model(paramsMap).then(function (model) {
            const view = new View(model, update);
            view.setScale(paramsMap.get("scale") ?? 1);
            //view.init(paramsMap.get("svgRoot"), paramsMap.get("drawContext"));
            var modalUpdate;
            function update(message) {
                if (message.action === "setData") {
                    model.setData(message.data);
                } else if (message.action === "typeset") {
                    return updateParentServices.get("MathJax")(message);
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
            return {
                model,
                view,
                update,
            };
        });
    });
}

export { init };
