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

function Model(paramMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const updateHandlers = [];
    const model = {
        hash: sha256(JSON.stringify(paramMap, { replacer: mapReplacer })),
        components: [],
    };
    const rootElement = document.createElement("div");
    var transform;
    function buildRepresentation(onUpdate) {
        paramMap.get("componentParamMaps").forEach(function (paramMap) {
            const moduleUrl = paramMap.get("module") ?? "./default.js";
            import(moduleUrl).then(function (module) {
                const subModel = new module["Model"](paramMap);
                rootElement.appendChild(subModel.rootElement);
                subModel.buildRepresentation(onUpdate);
                model.components.push(subModel);
            });
        });
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
    return Object.assign(self, {
        getModelData,
        exportModel,
        addUpdateHandler,
        buildRepresentation,
        rootElement,
    });
}

function main(paramMap, onUpdate) {
    const userStats = {
        email: "test@oddities.org",
        responses: [[1, 1]],
    };
    const container = document.getElementById("virginia-content");
    const model = new Model(paramMapB);
    container.appendChild(model.rootElement);
    model.buildRepresentation(onUpdate);
    const exportModelLink = document.createElement("a");
    exportModelLink.textContent = "Export";
    exportModelLink.addEventListener("click", model.exportModel);
    container.appendChild(exportModelLink);
}
export { main };
