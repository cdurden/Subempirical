import { any, all, getFile, mapReplacer, loadScript } from "../lib/common.js";

function View(model, update, paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    function render() {
        return new Promise(function (resolve) {
            rootElement.replaceChildren();
            const viewContainerElmt = document.createElement("div");
            rootElement.appendChild(viewContainerElmt);
            viewContainerElmt.textContent = model.data.prompt;
            const responseInputElmt = document.createElement("math-field");
            new Map([
                ["font-size", "32px"],
                ["margin", "3em"],
                ["padding", "8px"],
                ["border-radius", "8px"],
                ["border", "1px solid rgba(0, 0, 0, .3)"],
                ["box-shadow", "0 0 8px rgba(0, 0, 0, .2)"],
            ]).forEach(function (value, key) {
                responseInputElmt.style.setProperty(key, value);
            });
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
    });
}
function init(paramsMap) {
    const scripts = [
        //"/node_modules/mathlive/dist/mathlive.js",
        //"https://unpkg.com/@cortex-js/compute-engine?module",
        //"https://unpkg.com/mathlive?module",
        //"//unpkg.com/mathlive",
    ];
    const promptModuleUrl = new URL(
        paramsMap.get("promptModel") ?? "./Models/HtmPrompt.js",
        paramsMap.get("baseURL") ?? window.location.href
    );
    return import(promptModuleUrl).then(function (promptModule) {
        //const mathlive = modules[0];
        return new Model(paramsMap).then(function (model) {
            const view = new View(model, update);
            function update(message) {
                if (message.action === "") {
                    return;
                }
            }
            promptModule.init(paramsMap, update).then(function (promptMVU) {
                promptMVU.update({ action: "render" });
            });
            return {
                model,
                view,
                update,
            };
        });
    });
}

export { init };
