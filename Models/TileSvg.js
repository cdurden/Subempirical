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

function Model(paramsMap) {
    const self = Object.create(null);

    Object.setPrototypeOf(self, Model.prototype);
    const data = {
        label: paramsMap.get("label"),
    };
    function setLabel(label) {
        data.label = label;
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
                setLabel,
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
    const rootElement = document.createElement("g");
    Object.setPrototypeOf(view, View.prototype);
    var scale = 50;
    var transform;
    function init(svgRoot, draw) {
        view.svgRoot = svgRoot;
        view.draw = draw;
        view.group = draw.group();
        view.svgElmt = view.group.node;
        //view.svgElmt.createSVGTransform();
        view.svgElmt.transform.baseVal.appendItem(svgRoot.createSVGTransform());
        transform = view.svgElmt.getScreenCTM().inverse();
        transform.e = transform.f = 0;
    }
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
        return new Promise(function (resolve) {
            rootElement.replaceChildren();
            const viewContainerElmt = document.createElement("div");
            rootElement.appendChild(viewContainerElmt);
            const svg = view.draw.node;
            const pt = svg.createSVGPoint();

            const drawing = drawBox(
                view.group,
                0,
                0,
                model.getWidth(),
                model.getHeight(),
                1 > 0 ? "grey" : "white"
            );
            const text = drawText(view.group, 0, 0, model.data.label);
            view.group.node.classList.add("draggable");
            resolve(view);
        });
    }
    function show() {}
    function hide() {}
    function move(x, y) {
        view.x = x;
        view.y = y;
        const dA = new DOMPoint(x, y);
        const dB = dA.matrixTransform(transform);
        // translate the element
        view.svgElmt.transform.baseVal.getItem(0).setTranslate(dB.x, dB.y);
    }
    return Object.assign(view, {
        x: 0,
        y: 0,
        rootElement,
        render,
        modalView: undefined,
        init,
        show,
        hide,
        move,
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
            view.init(paramsMap.get("svgRoot"), paramsMap.get("drawContext"));
            var modalUpdate;
            function update(message) {
                if (message.action === "setData") {
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
            return {
                model,
                view,
                update,
            };
        });
    });
}

export { init };
