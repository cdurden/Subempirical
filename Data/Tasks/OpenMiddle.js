function mapReplacer(key, value) {
    if (value instanceof Map) {
        return {
            data: Array.from(value.entries()), // or with spread: value: [...value]
            dataType: "Map",
        };
    } else {
        return value;
    }
}

const taskParamsMap = new Map([
    [
        "OpenMiddle",
        new Map([
            ["moduleUrl", "./Models/OpenMiddle.js"],
            ["services", ["MathJax"]],
        ]),
    ],
    [
        "ExpressionFlowChart",
        new Map([
            ["moduleUrl", "./Models/lib/MathModels/ExpressionFlowChart.js"],
            ["services", ["MathJax"]],
        ]),
    ],
    [
        "SolveEquationFlowChart",
        new Map([
            ["moduleUrl", "./Models/lib/MathModels/SolveEquationFlowChart.js"],
            ["services", ["MathJax"]],
        ]),
    ],
]);
console.log(JSON.stringify(taskParamsMap, mapReplacer));
