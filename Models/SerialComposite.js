import {
    any,
    repeat,
    all,
    getFile,
    mapReplacer,
    mapReviver,
    loadScript,
    composeUpdateThenRender,
    dom,
} from "../lib/common.js";

function View(model, update, paramsMap) {
    const self = Object.create(null);
    const childViews = new Map();
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    const showChildButtons = new Map();
    const childViewContainers = new Map();
    const setContainers = new Map();
    var activeTaskPath = Array.from(model.tasks.keys())[0];
    /*
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
        update({ action: "showPrevious", activeTaskPath }, model, self);
    });
    */
    /*
            const childLabelContainer = document.createElement("label");
            childLabelContainer.style.setProperty(
                "border-bottom",
                "1px solid black"
            );
            childLabelContainer.textContent = label;
            const childViewContainer = document.createElement("div");
            const setIndex = Math.floor(
                taskIndex / paramsMap.get("tasks").length
            );
            if (taskIndex % paramsMap.get("tasks").length === 0) {
                const setContainer = document.createElement("div");
                //setContainer.style.setProperty("page-break-before", "always");
                const directionsContainer = document.createElement("div");
                directionsContainer.style.setProperty("float", "left");
                directionsContainer.style.setProperty("width", "100%");
                setContainer.appendChild(directionsContainer);
                directionsContainer.textContent = paramsMap.get("directions");
                if (paramsMap.has("printMode")) {
                    setContainer.style.setProperty("display", "flex");
                    setContainer.style.setProperty("flex-wrap", "wrap");
                }
                setContainers.set(setIndex, setContainer);
            }
            if (paramsMap.has("printMode")) {
                childViewContainer.style.setProperty("width", "25%");
                childViewContainer.style.setProperty("padding", "0% 4% 0% 2%");
                childViewContainer.style.setProperty("margin-bottom", "1em");
            }
            childViewContainers.set(taskIndex, childViewContainer);
            childViewContainer.appendChild(childLabelContainer);
            const setContainer = setContainers.get(setIndex);
            setContainer.appendChild(childViewContainer);
            viewContainerElmt.appendChild(setContainer);
            const showChildButtonElmt = document.createElement("button");
            showChildButtons.set(taskIndex, showChildButtonElmt);
            showChildButtonElmt.addEventListener("click", function (event) {
                update(
                    {
                        action: "showChild",
                        taskPath: taskIndex,
                    },
                    model
                );
            });
            showChildButtonElmt.textContent = label;
            navElmt.appendChild(showChildButtonElmt);
        })
        */
    function myDom() {
        const selectTaskDom = dom("select", {}, [
            ...model.tasks.map(function (task, taskIndex) {
                const label = model.labels?.[taskIndex] ?? taskIndex;
                const showChildButtonElmt = dom(
                    "option",
                    { value: taskIndex },
                    [label]
                );
                showChildButtons.set(taskIndex, showChildButtonElmt);
                return showChildButtonElmt;
            }),
        ]);
        selectTaskDom.addEventListener("change", function (e) {
            update(
                {
                    action: "showChild",
                    taskPath: Number(e.target.value),
                },
                model
            );
        });
        return dom("div", {}, [
            dom("div", { class: "serial-composite-nav" }, [selectTaskDom]),
            /*
            dom("div", { class: "serial-composite-nav" }, [
                ...model.tasks.map(function (task, taskIndex) {
                    const label = model.labels?.[taskIndex] ?? taskIndex;
                    const showChildButtonElmt = dom("button", {}, [label]);
                    showChildButtons.set(taskIndex, showChildButtonElmt);
                    showChildButtonElmt.addEventListener(
                        "click",
                        function (event) {
                            update(
                                {
                                    action: "showChild",
                                    taskPath: taskIndex,
                                },
                                model
                            );
                        }
                    );
                    return showChildButtonElmt;
                }),
            ]),
            */
            dom("div", { class: "serial-composite-task" }, [
                ...model.tasks.map(function (task, taskIndex) {
                    //showChildButtonElmt.textContent = label;
                    const childViewContainer = dom("div", {}, []);
                    childViewContainers.set(taskIndex, childViewContainer);
                    return childViewContainer;
                }),
                //dom("button", {}, "Previous"),
                //dom("button", {}, "Next"),
            ]),
        ]);
    }
    function render() {
        rootElement.replaceChildren();
        rootElement.appendChild(self.dom());
        /*
        mainElmt.className = "main";
        viewContainerElmt.style.setProperty("font-size", "16pt");
        //viewContainerElmt.appendChild(headingElmt);
        rootElement.appendChild(viewContainerElmt);
        viewContainerElmt.appendChild(mainElmt);
        if (!paramsMap.has("printMode")) {
            viewContainerElmt.appendChild(navElmt);
        }
        navElmt.appendChild(previousButtonElmt);
        model.tasks.forEach(function (task, taskIndex) {
            const label = model.labels?.[taskIndex] ?? taskIndex;
            const childLabelContainer = document.createElement("label");
            childLabelContainer.style.setProperty(
                "border-bottom",
                "1px solid black"
            );
            childLabelContainer.textContent = label;
            const childViewContainer = document.createElement("div");
            const setIndex = Math.floor(
                taskIndex / paramsMap.get("tasks").length
            );
            if (taskIndex % paramsMap.get("tasks").length === 0) {
                const setContainer = document.createElement("div");
                //setContainer.style.setProperty("page-break-before", "always");
                const directionsContainer = document.createElement("div");
                directionsContainer.style.setProperty("float", "left");
                directionsContainer.style.setProperty("width", "100%");
                setContainer.appendChild(directionsContainer);
                directionsContainer.textContent = paramsMap.get("directions");
                if (paramsMap.has("printMode")) {
                    setContainer.style.setProperty("display", "flex");
                    setContainer.style.setProperty("flex-wrap", "wrap");
                }
                setContainers.set(setIndex, setContainer);
            }
            if (paramsMap.has("printMode")) {
                childViewContainer.style.setProperty("width", "25%");
                childViewContainer.style.setProperty("padding", "0% 4% 0% 2%");
                childViewContainer.style.setProperty("margin-bottom", "1em");
            }
            childViewContainers.set(taskIndex, childViewContainer);
            childViewContainer.appendChild(childLabelContainer);
            const setContainer = setContainers.get(setIndex);
            setContainer.appendChild(childViewContainer);
            viewContainerElmt.appendChild(setContainer);
            const showChildButtonElmt = document.createElement("button");
            showChildButtons.set(taskIndex, showChildButtonElmt);
            showChildButtonElmt.addEventListener("click", function (event) {
                update(
                    {
                        action: "showChild",
                        taskPath: taskIndex,
                    },
                    model
                );
            });
            showChildButtonElmt.textContent = label;
            navElmt.appendChild(showChildButtonElmt);
        });
        navElmt.appendChild(nextButtonElmt);
        */
        updateButtonStates();
        return Promise.resolve(self);
    }
    function addChild(taskPath, childView) {
        childViews.set(taskPath, childView);
        childViewContainers.get(taskPath).appendChild(childView.rootElement);
        if (!paramsMap.has("printMode") && taskPath !== activeTaskPath) {
            childView.rootElement.style.display = "none";
        }
        return childView;
    }
    function updateButtonStates() {
        model.tasks.forEach(function (task, taskPath) {
            const showChildButtonElmt = showChildButtons.get(taskPath);
            if (taskPath === activeTaskPath) {
                showChildButtonElmt.className =
                    "pure-button pure-button-disabled";
            } else if (model.completed.get(taskPath)) {
                showChildButtonElmt.className = "pure-button";
            } else {
                showChildButtonElmt.className =
                    "pure-button pure-button-active";
            }
        });
        /*
        if (model.completed.get(activeTaskPath)) {
            nextButtonElmt.className = "pure-button pure-button-primary";
        } else {
            nextButtonElmt.className = "pure-button";
        }
        */
    }
    function showChild(taskPath) {
        activeTaskPath = taskPath;
        Array.from(childViews.entries()).forEach(function ([
            childTaskPath,
            childView,
        ]) {
            if (childTaskPath === activeTaskPath) {
                childView.rootElement.style.display = "block";
            } else if (!paramsMap.has("printMode")) {
                childView.rootElement.style.display = "none";
            }
        });
        updateButtonStates();
    }

    return Object.assign(self, {
        showChild,
        addChild,
        rootElement,
        render,
        dom: myDom,
    });
}
function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const childModels = new Map();
    const completed = new Map();
    const tasks = [];
    const labels = [];
    paramsMap.get("tasks").forEach(function (task) {
        tasks.push(...repeat(task, paramsMap.get("reps") ?? 1));
    });
    paramsMap.get("labels").forEach(function (label) {
        labels.push(
            ...repeat(label, paramsMap.get("reps") ?? 1).map(function (_, i) {
                return `${label} ${i + 1}`;
            })
        );
    });
    const data = {
        childModels: Array.from(childModels.keys()).map(function (childModel) {
            return childModel.data;
        }),
        //activeTaskPath: null,
        //activeIndex: 0,
    };
    function setCompleted(taskPath, value) {
        completed.set(taskPath, value);
    }
    function addChild(taskPath, childModel) {
        childModels.set(childModel, taskPath);
        completed.set(taskPath, false);
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
                addChild,
                completed,
                tasks,
                labels,
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
    const childUpdateQueues = new Map();
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
                    //model.data.activeIndex =
                    //    (model.data.activeIndex + 1) % model.childModels.length;
                    //view.render();
                } else if (message.action === "showPrevious") {
                    const taskPaths = Array.from(model.tasks.keys());
                    const prevActiveIndex = taskPaths.indexOf(
                        message.activeTaskPath
                    );
                    const newActiveIndex =
                        (taskPaths.length + prevActiveIndex - 1) %
                        taskPaths.length;
                    view.showChild(taskPaths[newActiveIndex]);
                    //view.render();
                } else if (message.action === "postFeedback") {
                    if (message.correct) {
                        model.setCompleted(message.taskPath, message.value);
                    }
                    //view.activeTaskPath = message.taskPath;
                    //view.render();
                } else if (message.action === "showChild") {
                    view.showChild(message.taskPath);
                    //view.activeTaskPath = message.taskPath;
                    //view.render();
                } else if (message.action === "addChild") {
                    model.addChild(message.taskPath, message.childModel);
                    view.addChild(message.taskPath, message.childView);
                    if (paramsMap.has("printMode")) {
                        message.childUpdate({
                            action: "setLabel",
                            label: message.taskPath,
                        });
                    }
                    /*
                    childUpdateQueues
                        .get(message.childModel)
                        .forEach(function (callUpdate) {
                            callUpdate();
                        });
                    */
                    // Clear queue
                    childUpdateQueues.set(message.childModel, []);
                } else if (message.action === "setCompleted") {
                    model.setCompleted(message.taskPath, message.value);
                    view.render();
                    /*
                } else if (message.action === "submit") {
                    updateParent({
                        ...message,
                        taskPath: model.childModels.get(message.model),
                    });
                    */
                } else if (message.action === "loadTask") {
                    const childParamsMap = message.paramsMap;
                    const moduleUrl = childParamsMap.get("moduleUrl");
                    return import(
                        new URL(moduleUrl, paramsMap.get("baseURL"))
                    ).then(function ({ init }) {
                        const mergedParamsMap = new Map([
                            ...Array.from(paramsMap.entries()),
                            ...Array.from(childParamsMap.entries()),
                        ]);
                        return init(mergedParamsMap, function (message) {
                            update({ ...message });
                        }).then(function (childMVU) {
                            update(
                                {
                                    action: "addChild",
                                    childModel: childMVU.model,
                                    childView: childMVU.view,
                                    childUpdate: childMVU.update,
                                    taskPath: message.taskPath,
                                },
                                model,
                                view
                            );
                            childMVU.view.render();
                            return childMVU;
                        });
                    });
                } else if (message.action === "getSubmissions") {
                    console.log("got submissions request from model");
                }
                if (!childUpdateQueues.has(message.model)) {
                    childUpdateQueues.set(message.model, []);
                }
                if (model.childModels.has(message.model)) {
                    updateParent({
                        ...message,
                        taskPath: model.childModels.get(message.model),
                    });
                } else {
                    childUpdateQueues.get(message.model).push(function () {
                        updateParent({
                            ...message,
                            taskPath: model.childModels.get(message.model),
                        });
                    });
                }
                return Promise.resolve(message);
            }

            const view = new View(model, update, paramsMap);
            const tasks = model.tasks;
            updateParent({
                action: "getTasks",
                tasks,
                update,
            });
            return Promise.resolve({
                model,
                view,
                update,
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
