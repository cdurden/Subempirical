import { all } from "../lib/common.js";

var ce = [];

function evaluate(expr, params) {
    ce.pushScope();
    Array.from(Object.entries(params)).forEach(function ([k, v]) {
        var parsedValue;
        if (v instanceof Object && "json" in v) {
            parsedValue = ce.box(JSON.parse(v.json));
        } else if (typeof v === "string") {
            parsedValue = ce.parse(v) ?? Number(v);
        } else {
            parsedValue = Number(v);
        }
        ce.assign(k, parsedValue);
    });
    const result = expr.evaluate();
    ce.popScope();
    return result;
}

function simplify(expression) {
    return ce.simplify(expression);
}
function isEqual(exprA, exprB) {
    return exprA.isEqual(exprB);
}
function isZero(expr) {
    return isEqual(expr, ce.parse("0"));
}
function evalsToZero(expr, params) {
    return isZero(evaluate(ce.parse(expr), params));
}
function init(paramsMap) {
    const ComputeEngine = paramsMap.get("cortexJsComputeEngine");
    ce = new ComputeEngine();
}
export { isEqual, isZero, evaluate, evalsToZero, init };
