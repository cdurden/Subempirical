import { loadResource } from "../../../lib/common.js";

function Model(paramsMap) {
    const self = {};
    const input = new Map();
    const checkerModuleUrl =
        paramsMap.get("checkerModule") ??
        "../../CortexJSComputeEngineChecker.js";
    const params = paramsMap.get("params") ?? {};
    return import(checkerModuleUrl).then(function (checkerModule) {
        return loadResource("CortexJS-Compute-Engine").then(function (
            cortexJsComputeModule
        ) {
            checkerModule.init(
                new Map([
                    ...Array.from(paramsMap.entries()),
                    [
                        "cortexJsComputeEngine",
                        cortexJsComputeModule.ComputeEngine,
                    ],
                ])
            );
            function setParams(newParams) {
                Object.assign(params, newParams);
            }
            return Object.assign(self, {
                input,
                paramsMap,
                setParams,
                params,
                checkerModule,
            });
        });
    });
}

function View(model, update) {
    const self = {};
    const children = [];
    const rootElement = document.createElement("div");
    function render() {
        //preact.render(myDom(preact), rootElement);
        update({ action: "typeset", element: rootElement });
        rootElement.replaceChildren();
        rootElement.appendChild(self.dom());
    }
    function addChild(child) {
        children.push(child);
    }
    return Object.assign(self, { rootElement, render, addChild, children });
}

export { Model, View };
