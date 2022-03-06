import { all, getFile, mapReplacer } from "../common.js";
//https://cdn.jsdelivr.net/npm/js-sha256@0.9.0/src/sha256.min.js
const paramMapB = new Map([
    [
        "componentParamMaps",
        [
            new Map([
                ["module", "./OpenMiddleMVC.js"],
                ["file", "./oddities/OpenMiddleExample.omtex"],
            ]),
            new Map([
                ["module", "./OpenMiddleMVC.js"],
                ["file", "./oddities/OpenMiddleExample.omtex"],
            ]),
        ],
    ],
]);

// Constants
function Controller(model, view) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Controller.prototype);
    function bind() {
        model.getComponents().forEach(function (mvc) {
            mvc.controller.bind();
        });
    }
    return Object.assign(self, {
        bind,
    });
}
function View(model) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    const views = model.getComponents().map(function (mvc) {
        return mvc.view;
    });
    var transform;
    function render() {
        /*
        // Performing MathJax typesetting in parallel does not work.
        return Promise.all(
            views.map(function (view) {
                rootElement.appendChild(view.rootElement);
                return view.render();
            })
        );
        */
        return views.reduce(function (renderPromise, view) {
            const container = document.createElement("div");
            container.style.margin = "2em";
            rootElement.appendChild(container);
            container.appendChild(view.rootElement);
            return renderPromise.then(function () {
                return view.render();
            });
        }, Promise.resolve());
    }
    return Object.assign(self, {
        rootElement,
        render,
    });
}

function Model(paramMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const model = {
        hash: sha256(JSON.stringify(paramMap, { replacer: mapReplacer })),
        components: [],
    };
    const updateHandlers = [];
    return new Promise(function (resolve) {
        Promise.all(
            paramMap
                .get("componentParamMaps")
                .map(function (componentParamMap) {
                    return import(componentParamMap.get("module")).then(
                        function (module) {
                            return module["init"](componentParamMap);
                        }
                    );
                })
        ).then(function (mvcs) {
            model.components = mvcs;
            resolve(
                Object.assign(self, {
                    getModelData,
                    exportModel,
                    addUpdateHandler,
                    getComponents,
                })
            );
        });
    });
    function getComponents() {
        return model.components;
    }
    function getModelData() {
        return model;
    }
    function exportModel() {
        const blob = new Blob([JSON.stringify(getModelData(), mapReplacer)], {
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
    function addUpdateHandler(updateHandler) {
        updateHandlers.push(updateHandler);
    }
}

function init(paramMap, onUpdate) {
    return new Model(paramMap).then(function (model) {
        const view = new View(model);
        const controller = new Controller(model, view);
        return { model, view, controller };
    });
}

function main(paramMap, onUpdate) {
    const container = document.getElementById("virginia-content");
    init(paramMapB, onUpdate).then(function (mvc) {
        container.appendChild(mvc.view.rootElement);
        mvc.view.render().then(function (view) {
            mvc.controller.bind();
            mvc.model.addUpdateHandler(view.updateTiles);
            const exportModelLink = document.createElement("a");
            exportModelLink.textContent = "Export";
            exportModelLink.addEventListener("click", mvc.model.exportModel);
            container.appendChild(exportModelLink);
        });
    });
}
export { main };
