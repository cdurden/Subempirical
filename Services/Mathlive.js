import { loadResource } from "../lib/common.js";

function init(paramsMap, updateParentServices) {
    return loadResource(
        "Mathlive",
        { baseURL: paramsMap.get("baseURL") },
        false
    ).then(function (mathliveModule) {
        function update(message) {
            return Promise.resolve();
        }
        return update;
    });
}

export { init };
