function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function init({ taskId, baseURL }) {
    const seed = getRandomInt(10000);
    import("./lib/common.js").then(function ({ getFile, mapReviver }) {
        getFile("./Data/Tasks/Chapter9.json", {
            transformResponse: (response) => response,
            baseURL,
        })
            .then(function (response) {
                return JSON.parse(response.data, mapReviver);
            })
            .then(function (taskParamsMap) {
                const paramsMap = taskParamsMap.get(taskId);
                paramsMap.set("baseURL", baseURL);
                paramsMap.set("taskParamsMap", taskParamsMap);
                paramsMap.set("seed", seed);
                const moduleUrl =
                    paramsMap.get("moduleUrl") ?? "./Models/FileViewer.js";
                import(moduleUrl).then(function ({ init }) {
                    const container = document.getElementById(
                        "virginia-content"
                    );
                    const listenersMap = new Map();
                    function update(message) {
                        if (message.action === "addEventListener") {
                            if (!listenersMap.has(message.eventName)) {
                                listenersMap.set(message.eventName, []);
                            }
                            listenersMap
                                .get(message.eventName)
                                .push(message.listener);
                        }
                        return Promise.resolve(message);
                    }
                    init(paramsMap, update).then(function ({
                        model,
                        view,
                        update,
                    }) {
                        //update({ message: "init" }, model).then(function (message) {
                        //view.render(model, update, {}).then(function () {
                        container.appendChild(view.rootElement);
                        view.render().then(function () {
                            (listenersMap.get("mounted") ?? []).forEach(
                                function (listener) {
                                    listener();
                                }
                            );
                        });
                        const exportModelLink = document.createElement("a");
                        exportModelLink.textContent = "Export";
                        exportModelLink.addEventListener(
                            "click",
                            model.exportModel
                        );
                        container.appendChild(exportModelLink);
                    });
                });
            });
    });
}
