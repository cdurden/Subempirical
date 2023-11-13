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
        "ProportionalRelationshipTable",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            [
                "tasks",
                [
                    "ProportionalRelationshipTableBasic",
                    "ProportionalRelationshipTableIntermediate",
                    "ProportionalRelationshipTableAdvanced",
                ],
            ],
            ["labels", ["Basic", "Intermediate", "Advanced"]],
            ["reps", [4, 3, 2]],
            ["directions", ""],
        ]),
    ],
    [
        "TapeDiagram",
        new Map([
            ["moduleUrl", "./Models/HtmlTapeDiagram.js"],
            [
                "promptModel",
                "./Models/lib/MathModels/ProportionalRelationshipTable.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    ["xlab", { generator: "raw", options: { value: "x" } }],
                    ["ylab", { generator: "raw", options: { value: "y" } }],
                    [
                        "b",
                        {
                            generator: "randFrom",
                            options: { from: [4, 5, 8, 10] },
                        },
                    ],
                    [
                        "a",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 1 },
                        },
                    ],
                    [
                        "range",
                        {
                            generator: "dynamicRange",
                            options: {
                                min: 1,
                                max: "b-1",
                                step: 1,
                            },
                        },
                    ],
                    [
                        "x",
                        {
                            generator: "dynamicSample",
                            options: {
                                from: "range",
                                n: 3,
                            },
                        },
                    ],
                    [
                        "y",
                        {
                            generator: "truncate",
                            options: {
                                n: 1,
                                generator: "map",
                                options: {
                                    vector: "x",
                                    expr: "a/b*x_i",
                                },
                            },
                        },
                    ],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "ProportionalRelationshipTableBasic",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            [
                "promptModel",
                "./Models/lib/MathModels/ProportionalRelationshipTable.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "xlab",
                        {
                            generator: "raw",
                            options: { value: "flour" },
                        },
                    ],
                    [
                        "ylab",
                        {
                            generator: "raw",
                            options: { value: "water" },
                        },
                    ],
                    [
                        "b",
                        {
                            generator: "raw",
                            options: { value: 1 },
                        },
                    ],
                    [
                        "a",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 10 },
                        },
                    ],
                    [
                        "range",
                        {
                            generator: "dynamicRange",
                            options: {
                                min: 1,
                                max: 20,
                                step: 1,
                            },
                        },
                    ],
                    [
                        "x",
                        {
                            generator: "dynamicSample",
                            options: {
                                from: "range",
                                n: 3,
                            },
                        },
                    ],
                    [
                        "y",
                        {
                            generator: "truncate",
                            options: {
                                n: 1,
                                generator: "map",
                                options: {
                                    vector: "x",
                                    expr: "a/b*x_i",
                                },
                            },
                        },
                    ],
                ]),
            ],
        ]),
    ],
    [
        "ProportionalRelationshipTableIntermediate",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            [
                "promptModel",
                "./Models/lib/MathModels/ProportionalRelationshipTable.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "xlab",
                        {
                            generator: "raw",
                            options: { value: "flour" },
                        },
                    ],
                    [
                        "ylab",
                        {
                            generator: "raw",
                            options: { value: "water" },
                        },
                    ],
                    [
                        "b",
                        {
                            generator: "randPrime",
                            options: { min: 3, max: 7 },
                        },
                    ],
                    [
                        "a",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 2, max: "b-1" },
                        },
                    ],
                    [
                        "range",
                        {
                            generator: "dynamicRange",
                            options: {
                                min: "b",
                                max: 20,
                                step: "b",
                            },
                        },
                    ],
                    [
                        "x",
                        {
                            generator: "dynamicSample",
                            options: {
                                from: "range",
                                n: 3,
                            },
                        },
                    ],
                    [
                        "y",
                        {
                            generator: "truncate",
                            options: {
                                n: 1,
                                generator: "map",
                                options: {
                                    vector: "x",
                                    expr: "a/b*x_i",
                                },
                            },
                        },
                    ],
                ]),
            ],
        ]),
    ],
    [
        "ProportionalRelationshipTableAdvanced",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            [
                "promptModel",
                "./Models/lib/MathModels/ProportionalRelationshipTable.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "xlab",
                        {
                            generator: "raw",
                            options: { value: "flour" },
                        },
                    ],
                    [
                        "ylab",
                        {
                            generator: "raw",
                            options: { value: "water" },
                        },
                    ],
                    [
                        "b",
                        {
                            generator: "randPrime",
                            options: { min: 3, max: 7 },
                        },
                    ],
                    [
                        "a",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 2, max: "b-1" },
                        },
                    ],
                    [
                        "range",
                        {
                            generator: "dynamicRange",
                            options: {
                                min: "b+1",
                                max: 20,
                                step: "1",
                            },
                        },
                    ],
                    [
                        "x",
                        {
                            generator: "dynamicSample",
                            options: {
                                from: "range",
                                n: 3,
                            },
                        },
                    ],
                    [
                        "y",
                        {
                            generator: "truncate",
                            options: {
                                n: 1,
                                generator: "map",
                                options: {
                                    vector: "x",
                                    expr: "a/b*x_i",
                                },
                            },
                        },
                    ],
                ]),
            ],
        ]),
    ],
]);
console.log(JSON.stringify(taskParamsMap, mapReplacer));
