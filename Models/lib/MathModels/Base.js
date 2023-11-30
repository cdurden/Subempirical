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
            const ce = new cortexJsComputeModule.ComputeEngine();
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
                ce,
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
    const children = new Map();
    const rootElement = document.createElement("div");
    function render() {
        //preact.render(myDom(preact), rootElement);
        rootElement.replaceChildren();
        rootElement.appendChild(self.dom());
        update({ action: "typeset", element: rootElement });
    }
    function addChild(childId, child) {
        children.set(childId, child);
    }
    return Object.assign(self, { rootElement, render, addChild, children });
}

export { Model, View };
