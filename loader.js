function cyrb128(str) {
    let h1 = 1779033703,
        h2 = 3144134277,
        h3 = 1013904242,
        h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [
        (h1 ^ h2 ^ h3 ^ h4) >>> 0,
        (h2 ^ h1) >>> 0,
        (h3 ^ h1) >>> 0,
        (h4 ^ h1) >>> 0,
    ];
}
function mulberry32(a) {
    return function () {
        var t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function init(paramsMap, updateParent) {
    const updateParentServices = new Map([["parent", updateParent]]);
    const moduleUrl = paramsMap.get("moduleUrl") ?? "./Models/FileViewer.js";
    const serviceLoaderUrl = "./ServiceLoader.js";
    const rand = mulberry32(cyrb128(String(paramsMap.get("seed")))[0]);
    paramsMap.set("rand", rand);
    import(new URL(serviceLoaderUrl, paramsMap.get("baseURL"))).then(function (
        serviceLoaderModule
    ) {
        serviceLoaderModule
            .init(paramsMap, updateParentServices)
            .then(function (updateServices) {
                import(new URL(moduleUrl, paramsMap.get("baseURL"))).then(
                    function (module) {
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
                            return updateServices.get(message.to ?? "parent")(
                                message
                            );
                        }
                        module
                            .init(
                                paramsMap,
                                new Map([...updateServices, ["loader", update]])
                            )
                            .then(function ({ model, view, update }) {
                                updateServices.get("parent")({
                                    action: "init",
                                    paramsMap,
                                });
                                container.appendChild(view.rootElement);
                                view.render().then(function () {
                                    (listenersMap.get("mounted") ?? []).forEach(
                                        function (listener) {
                                            listener();
                                        }
                                    );
                                });
                            });
                    }
                );
            });
    });
}
