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
        "AlgebraTiles",
        new Map([
            ["moduleUrl", "./Models/AlgebraTiles.js"],
        ]),
    ],
]);
console.log(JSON.stringify(taskParamsMap, mapReplacer));
