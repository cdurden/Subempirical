import { loadService } from "./lib/common.js";

function init(paramsMap, baseServices) {
    return Promise.all(
        (paramsMap.get("services") ?? []).map(function (serviceName) {
            return loadService(serviceName, {
                baseURL: paramsMap.get("baseURL"),
            })
                .then(function (serviceModule) {
                    return serviceModule
                        .init(paramsMap, baseServices)
                        .then(function (updateService) {
                            return [serviceName, updateService];
                        });
                })
                .catch((error) => {
                    console.error(error.message);
                });
        })
    ).then(function (newServices) {
        return new Map([...baseServices, ...newServices]);
    });
}
export { init };
