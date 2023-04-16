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
const repoBaseUrl = undefined;
//"https://cdn.jsdelivr.net/gh/cdurden/Subempirical@a134c39e9d2222c12a71105ba8efdab30c1ef528/";
const paramsMaps = new Map([
    [
        "GoalCheck1",
        new Map([
            ["repoBaseUrl", repoBaseUrl],
            ["moduleUrl", `${repoBaseUrl ?? ""}/Models/WheelOfLife.js`],
            ["file", `${repoBaseUrl ?? ""}/Data/WheelOfLife/Teaching.json`],
        ]),
    ],
    [
        "EnterExponentExample1",
        new Map([
            ["repoBaseUrl", repoBaseUrl],
            ["moduleUrl", `${repoBaseUrl ?? ""}/Models/MathliveField.js`],
            ["prompt", "enterExponentExample1"],
        ]),
    ],
]);

console.log(
    JSON.stringify(
        ["GoalCheck1", "EnterExponentExample1"].map(function (taskId) {
            return paramsMaps.get(taskId);
        }),
        (replacer = mapReplacer)
    )
);
