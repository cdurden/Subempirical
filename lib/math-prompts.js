import { getFile } from "./common.js";
function stringTemplateParser(expression, valueObj) {
    const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
    let text = expression.replace(
        templateMatcher,
        (substring, value, index) => {
            value = valueObj.get(value);
            return value;
        }
    );
    return text;
}
function getPrompt(paramsMap) {
    const promptsDataUrl = new URL(
        paramsMap.get("promptTemplates") ?? "./Data/MathPrompts/default.json",
        paramsMap.get("repoBaseUrl") ?? window.location.href
    );
    return getFile(promptsDataUrl).then(function (response) {
        return stringTemplateParser(
            response.data[paramsMap.get("prompt")],
            paramsMap
        );
    });
}
// TODO: add a function that generates parameters

export { getPrompt };
