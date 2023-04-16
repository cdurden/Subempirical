import {
    any,
    all,
    getFile,
    mapReplacer,
    mapReviver,
    loadScript,
    composeUpdateThenRender,
} from "../lib/common.js";

function View(model, update) {
    const self = Object.create(null);
    const childRenderers = [];
    const childViews = [];
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    const viewContainerElmt = document.createElement("div");
    const mainElmt = document.createElement("div");
    const navElmt = document.createElement("div");
    const previousButtonElmt = document.createElement("button");
    const nextButtonElmt = document.createElement("button");
    previousButtonElmt.className = "pure-button";
    nextButtonElmt.className = "pure-button";
    nextButtonElmt.textContent = "Next";
    previousButtonElmt.textContent = "Previous";
    nextButtonElmt.addEventListener("click", function (event) {
        update({ action: "showNext" }, model, self);
    });
    previousButtonElmt.addEventListener("click", function (event) {
        update({ action: "showPrevious" }, model, self);
    });
    function render() {
        rootElement.replaceChildren();
        viewContainerElmt.replaceChildren();
        navElmt.replaceChildren();
        mainElmt.className = "main";
        viewContainerElmt.appendChild(mainElmt);
        rootElement.appendChild(viewContainerElmt);
        viewContainerElmt.appendChild(navElmt);
        navElmt.appendChild(previousButtonElmt);
        if (model.completed[model.data.activeIndex]) {
            nextButtonElmt.className = "pure-button pure-button-primary";
        } else {
            nextButtonElmt.className = "pure-button";
        }
        return Promise.all(
            childViews.map(function (childView, childIndex) {
                mainElmt.appendChild(childView.rootElement);
                return childView.render().then(function (childView) {
                    const showItemButtonElmt = document.createElement("button");
                    if (childIndex === model.data.activeIndex) {
                        showItemButtonElmt.className =
                            "pure-button pure-button-disabled";
                    } else if (model.completed[childIndex]) {
                        showItemButtonElmt.className = "pure-button";
                    } else {
                        showItemButtonElmt.className =
                            "pure-button pure-button-active";
                    }
                    showItemButtonElmt.addEventListener(
                        "click",
                        function (event) {
                            update(
                                {
                                    action: "showItem",
                                    itemIndex: childIndex,
                                },
                                model
                            );
                        }
                    );
                    showItemButtonElmt.textContent = `${childIndex + 1}`;
                    navElmt.appendChild(showItemButtonElmt);
                    return childView;
                });
            })
        ).then(function (childViews) {
            navElmt.appendChild(nextButtonElmt);
            navElmt.className = "nav pure-u";
            childViews.forEach(function (childView, childIndex) {
                if (childIndex === model.data.activeIndex) {
                    childView.rootElement.style.display = "block";
                } else {
                    childView.rootElement.style.display = "none";
                }
            });
            return self;
        });
    }
    return Object.assign(self, {
        childRenderers,
        childViews,
        rootElement,
        render,
    });
}
function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const childModels = [];
    const completed = [];
    const data = {
        childModels: childModels.map(function (childModel) {
            return childModel.data;
        }),
        activeIndex: 0,
    };
    function setCompleted(childIndex, value) {
        completed[childIndex] = value;
    }
    function addChildModel(childModel) {
        childModels.push(childModel);
        completed.push(false);
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
                childModels,
                setCompleted,
                addChildModel,
                completed,
                //update,
            })
        );
    });
}
function init(paramsMap, updateParent) {
    const scriptSourceMap = new Map([
        ["localhost", []],
        ["other", []],
    ]);
    const hostname = window.location.hostname;
    const scriptSource = scriptSourceMap.has(hostname) ? hostname : "other";
    return Promise.all(
        scriptSourceMap.get(scriptSource).map(function (script) {
            return loadScript(script);
        })
    ).then(function (modules) {
        return new Model(paramsMap).then(function (model) {
            function update(message) {
                if (message.action === "showNext") {
                    model.data.activeIndex =
                        (model.data.activeIndex + 1) % model.childModels.length;
                    view.render();
                } else if (message.action === "showPrevious") {
                    model.data.activeIndex =
                        (model.childModels.length +
                            model.data.activeIndex -
                            1) %
                        model.childModels.length;
                    view.render();
                } else if (message.action === "showItem") {
                    model.data.activeIndex = message.itemIndex;
                    view.render();
                } else if (message.action === "addChild") {
                    model.addChildModel(message.childModel);
                    view.childViews.push(message.childView);
                } else if (message.action === "updateChild") {
                    model.childModels[message.childIndex] = message.childModel;
                } else if (message.action === "setCompleted") {
                    model.setCompleted(message.childIndex, message.value);
                    view.render();
                }
                return updateParent(message);
                //return Promise.resolve();
            }

            const view = new View(model, update);
            return new Promise(function (resolve) {
                if (paramsMap.has("paramsMaps")) {
                    resolve(paramsMap.get("paramsMaps"));
                } else if (
                    paramsMap.has("tasks") &&
                    paramsMap.has("taskParamsMap")
                ) {
                    const taskParamsMap = paramsMap.get("taskParamsMap");
                    resolve(
                        paramsMap.get("tasks").map(function (taskId) {
                            return taskParamsMap.get(taskId);
                        })
                    );
                } else {
                    getFile(paramsMap.get("file"), {
                        transformResponse: (response) => response,
                    }).then(function (response) {
                        resolve(JSON.parse(response.data, mapReviver));
                    });
                }
            }).then(function (paramsMaps) {
                return Promise.all(
                    paramsMaps.map(function (childParamsMap, childIndex) {
                        const mergedParamsMap = new Map([
                            ...Array.from(paramsMap.entries()),
                            ...Array.from(childParamsMap.entries()),
                        ]);
                        const moduleUrl = childParamsMap.get("moduleUrl");
                        return import(moduleUrl).then(function ({ init }) {
                            return init(mergedParamsMap, function (message) {
                                update({ ...message, childIndex });
                            }).then(function (childMVU) {
                                return childMVU;
                            });
                        });
                    })
                ).then(function (childMVUs) {
                    childMVUs.forEach(function (childMVU) {
                        update(
                            {
                                action: "addChild",
                                childModel: childMVU.model,
                                childView: childMVU.view,
                            },
                            model,
                            view
                        );
                    });
                    return {
                        model,
                        view,
                        update,
                    };
                });
            });
        });
    });
}

/*
function main(paramsMap, postUpdateCallback) {
    const container = document.getElementById("virginia-content");
    init(paramsMap, postUpdateCallback).then(function (mvu) {
        container.appendChild(mvu.view.rootElement);
        mvu.view.render(mvu.model).then(function (view) {
            const exportModelLink = document.createElement("a");
            exportModelLink.textContent = "Export";
            exportModelLink.addEventListener("click", mvu.model.exportModel);
            container.appendChild(exportModelLink);
            MathJax.startup.defaultPageReady();
            //MathJax.typeset();
        });
    });
}
*/
export { init };
