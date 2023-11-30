import { loadService } from "./lib/common.js";

function init(paramsMap, parentServices) {
    return Promise.all(
        paramsMap.get("services").map(function (serviceName) {
            return loadService(serviceName).then(function (serviceModule) {
                return serviceModule
                    .init(paramsMap, parentServices)
                    .then(function (updateService) {
                        return [serviceName, updateService];
                    });
            });
        })
    );
}
export { init };
