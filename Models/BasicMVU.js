import { any, all, getFile, mapReplacer } from "../lib/common.js";

function View(update) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    function render(model) {
        return new Promise(function (resolve) {
            rootElement.replaceChildren();
            const viewContainerElmt = document.createElement("div");
            rootElement.appendChild(viewContainerElmt);
            viewContainerElmt.textContent = model.data.prompt;
            const responseInputElmt = document.createElement("input");
            responseInputElmt.value = model.data.response;
            viewContainerElmt.appendChild(responseInputElmt);
            responseInputElmt.addEventListener("change", function (event) {
                update(
                    { action: "updateModel", response: event.target.value },
                    self
                );
            });
            resolve(self);
        });
    }
    return Object.assign(self, {
        rootElement,
        render,
    });
}
function makeUpdateFunction(model) {
    return function update(message, view) {
        if (message.action === "updateModel") {
            model.data.response = message.response;
        }
        view.render(model);
        return true;
    };
}

function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const data = { prompt: "What is your name?", response: null };
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
            })
        );
        /*
        getFile(paramsMap.get("file")).then(function (response) {
            data.omtex = response.data;
            resolve(
                Object.assign(self, {
                    data,
                    exportModel,
                    update,
                })
            );
        });
        */
    });
}
function init(paramsMap) {
    return new Model(paramsMap).then(function (model) {
        const update = makeUpdateFunction(model);
        const view = new View(update);
        return { model, view, update };
    });
}

function main(paramsMap, onUpdate) {
    const container = document.getElementById("virginia-content");
    init(paramsMap).then(function (mvu) {
        container.appendChild(mvu.view.rootElement);
        mvu.view.render(mvu.model).then(function (view) {
            const exportModelLink = document.createElement("a");
            exportModelLink.textContent = "Export";
            exportModelLink.addEventListener("click", mvu.model.exportModel);
            container.appendChild(exportModelLink);
        });
    });
}
export { init, main, Model };
