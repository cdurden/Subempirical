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
    const view = Object.create(null);
    const childViews = new Map();
    const rootElement = document.createElement("div");
    const showChildButtons = new Map();
    const childViewContainers = new Map(
        Array.from(model.tasks).map(function ([taskKey, task], taskIndex) {
            const childViewContainer = dom(
                "div",
                { class: "serial-composite-task" }
                //[dom("h2", {}, [model.labels[taskIndex]])]
            );
            if (
                !paramsMap.has("printMode") &&
                taskKey !== activeTaskKey &&
                taskIndex > 0
            ) {
                childViewContainer.style.display = "none";
            }
            return [taskKey, childViewContainer];
        })
    );
    const setContainers = new Map();
    var activeTaskKey = Array.from(model.tasks.keys())[0];
    function myDom() {
        const headingDom = dom("div", {}, [
            dom("div", { style: "font-size: 18pt; float: right" }, []),
            dom("h2", {}, [paramsMap.get("title")]),
        ]);
        const selectTaskDom = dom("select", {}, [
            ...Array.from(model.tasks.entries()).map(function (
                [taskKey, task],
                taskIndex
            ) {
                const label = task.label;
                const showChildButtonElmt = dom(
                    "option",
                    {
                        value: taskKey,
                    },
                    [
                        label,
                        ` ${(
                            model.childModelMetadataMap.get(
                                model.tasks.get(taskKey).model
                            )?.history ?? []
                        )
                            .map(function (correct) {
                                return correct ? "✓" : "✗";
                            })
                            .join("")}`,
                        /*
                        ` ${
                            model.childModelMetadataMap.get(
                                model.tasks.get(taskKey).model
                            )?.correct
                                ? "✓"
                                : "✗"
                        }`,
                        */
                    ]
                );
                if (taskKey === activeTaskKey)
                    showChildButtonElmt.setAttribute("selected", "selected");
                showChildButtons.set(taskIndex, showChildButtonElmt);
                return showChildButtonElmt;
            }),
        ]);
        selectTaskDom.addEventListener("change", function (e) {
            update(
                {
                    action: "showChild",
                    taskKey: e.target.value,
                },
                model
            );
        });
        return dom("div", {}, [
            dom(
                "div",
                { class: "serial-composite-nav" },
                paramsMap.get("printMode") ? [] : [selectTaskDom]
            ),
            headingDom,
            ...Array.from(childViewContainers.values()),
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
            dom("div", {}, [
                //dom("button", {}, "Previous"),
                //dom("button", {}, "Next"),
            ]),
        ]);
    }
    function render() {
        rootElement.replaceChildren();
        rootElement.appendChild(view.dom());
        Array.from(childViews.entries()).forEach(function ([
            taskKey,
            childView,
        ]) {
            rootElement.appendChild(childViewContainers.get(taskKey));
            childView.render();
        });
        return Promise.resolve(view);
    }
    function addChild(taskKey, childView) {
        childViews.set(taskKey, childView);
        childViewContainers.get(taskKey).appendChild(childView.rootElement);
        return childView;
    }
    function showChild(taskKey) {
        activeTaskKey = taskKey;
        Array.from(childViewContainers.entries()).forEach(function ([
            childTaskPath,
            childViewContainer,
        ]) {
            if (childTaskPath === activeTaskKey) {
                childViewContainer.style.display = "block";
            } else if (!paramsMap.has("printMode")) {
                childViewContainer.style.display = "none";
            }
        });
    }

    return Object.assign(view, {
        showChild,
        addChild,
        rootElement,
        render,
        dom: myDom,
    });
}
function Model(paramsMap) {
    const model = Object.create(null);
    Object.setPrototypeOf(model, Model.prototype);
    const childModelMetadataMap = new Map();
    const tasks = new Map(
        Array.from(paramsMap.get("tasks").entries()).reduce(function (
            acc,
            [taskKey, task]
        ) {
            return [
                ...acc,
                ...repeat(task, task.reps).map(function (task, repIndex) {
                    const newTask = Object.assign({}, task);
                    newTask.label = `${newTask.label} ${repIndex + 1}`;
                    return [`${taskKey}[${repIndex}]`, newTask];
                }),
            ];
        },
        [])
    );
    function setTaskModel(taskKey, model) {
        tasks.get(taskKey).model = model;
    }
    /*
    const tasks = [];
    const labels = [];
    paramsMap.get("tasks").forEach(function (task, taskIndex) {
        tasks.push(...repeat(task, paramsMap.get("reps")?.[taskIndex] ?? 1));
    });
    paramsMap.get("labels").forEach(function (label, taskIndex) {
        labels.push(
            ...repeat(label, paramsMap.get("reps")?.[taskIndex] ?? 1).map(
                function (_, i) {
                    return `${label} ${i + 1}`;
                }
            )
        );
    });
    */
    /*
    const data = {
        childModels: Array.from(childModels.keys()).map(function (childModel) {
            return childModel.data;
        }),
    };
    */
    function setCompleted(childModel, value) {
        childModelMetadataMap.get(childModel).completed = value;
    }
    function addChild(taskKey, childModel) {
        childModelMetadataMap.set(childModel, { taskKey, completed: false });
    }
    return new Promise(function (resolve) {
        resolve(
            Object.assign(model, {
                //data,
                childModelMetadataMap,
                setCompleted,
                addChild,
                tasks,
                setTaskModel,
                //labels,
                //update,
            })
        );
    });
}
function init(paramsMap, updateParentServices) {
    const updateParent = updateParentServices.get("parent");
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
                if (message.action === "showChild") {
                    view.showChild(message.taskKey);
                } else if (message.action === "sendFeedback") {
                    model.childModelMetadataMap.get(message.model).correct =
                        message.feedbackModel.correct;
                    model.childModelMetadataMap.get(message.model).history =
                        message.feedbackModel.history;
                    view.render();
                } else if (message.action === "addChild") {
                    model.addChild(message.taskKey, message.childModel);
                    view.addChild(message.taskKey, message.childView);
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
                    //model.setCompleted(message.taskPath, message.value);
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
                        // Why do we need to merge these?
                        const mergedParamsMap = new Map([
                            ...Array.from(paramsMap.entries()),
                            ...Array.from(childParamsMap.entries()),
                        ]);
                        return init(
                            mergedParamsMap,
                            new Map([
                                ...updateParentServices,
                                [
                                    "parent",
                                    function (message) {
                                        update({ ...message });
                                    },
                                ],
                            ])
                        ).then(function (childMVU) {
                            model.setTaskModel(message.taskKey, childMVU.model);
                            update(
                                {
                                    action: "addChild",
                                    childModel: childMVU.model,
                                    childView: childMVU.view,
                                    childUpdate: childMVU.update,
                                    taskKey: message.taskKey,
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
                if (model.childModelMetadataMap.has(message.model)) {
                    updateParent({
                        ...message,
                        taskPath: `${paramsMap.get("taskPath")}.${
                            model.childModelMetadataMap.get(message.model)
                                .taskKey
                        }`,
                    });
                } else {
                    childUpdateQueues.get(message.model).push(function () {
                        updateParent({
                            ...message,
                            taskPath: `${paramsMap.get("taskPath")}.${
                                model.childModelMetadataMap.get(message.model)
                                    .taskKey
                            }`,
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

export { init };
