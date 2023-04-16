function init(paramsMap, updateParent) {
    const moduleUrl = paramsMap.get("moduleUrl") ?? "./Models/FileViewer.js";
    import(moduleUrl).then(function (module) {
        const container = document.getElementById("virginia-content");
        const listenersMap = new Map();
        function update(message) {
            if (message.action === "addEventListener") {
                if (!listenersMap.has(message.eventName)) {
                    listenersMap.set(message.eventName, []);
                }
                listenersMap.get(message.eventName).push(message.listener);
            }
            return updateParent(message);
        }
        module.init(paramsMap, update).then(function ({ model, view, update }) {
            updateParent({ action: "init", paramsMap });
            //view.render(model, update, {}).then(function () {
            container.appendChild(view.rootElement);
            view.render().then(function () {
                (listenersMap.get("mounted") ?? []).forEach(function (
                    listener
                ) {
                    listener();
                });
            });
            const exportModelLink = document.createElement("a");
            exportModelLink.textContent = "Export";
            exportModelLink.addEventListener("click", model.exportModel);
            container.appendChild(exportModelLink);
        });
    });
}
