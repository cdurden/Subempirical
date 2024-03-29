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
            ["reps", [1, 3, 3]],
            ["directions", ""],
        ]),
    ],
    [
        "TapeDiagram",
        new Map([
            ["moduleUrl", "./Models/HtmlTapeDiagram.js"],
            [
                "promptModule",
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
                "promptModule",
                "./Models/lib/MathModels/ProportionalRelationshipTable.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "xlab",
                        {
                            generator: "raw",
                            options: { value: "mix" },
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
                "promptModule",
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
                "promptModule",
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
                        "d",
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
                        "z",
                        {
                            generator: "map",
                            options: {
                                vector: "x",
                                expr: "d*x_i",
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
        "DescribeProportionalRelationshipBasic",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            [
                "promptModule",
                "./Models/lib/MathModels/DescribeProportionalRelationship.js",
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
                        "d",
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
                        "z",
                        {
                            generator: "map",
                            options: {
                                vector: "x",
                                expr: "d*x_i",
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
        "ProportionalRelationshipCompositeBasicA",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            [
                "promptModule",
                "./Models/lib/MathModels/ProportionalRelationshipComposite.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "person",
                        {
                            generator: "raw",
                            options: { value: "Emma" },
                        },
                    ],
                    [
                        "gender",
                        {
                            generator: "raw",
                            options: { value: "f" },
                        },
                    ],
                    [
                        "recipe",
                        {
                            generator: "raw",
                            options: { value: "pancakes" },
                        },
                    ],
                    [
                        "xvar",
                        {
                            generator: "raw",
                            options: { value: "m" },
                        },
                    ],
                    [
                        "yvar",
                        {
                            generator: "raw",
                            options: { value: "w" },
                        },
                    ],
                    [
                        "xlab",
                        {
                            generator: "raw",
                            options: { value: "mix" },
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
                            options: { min: 1, max: 1 },
                        },
                    ],
                    [
                        "range",
                        {
                            generator: "dynamicRange",
                            options: {
                                min: 2,
                                max: 7,
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
        "ProportionalRelationshipInverseCompositeBasicB",
        new Map([
            [
                "moduleUrl",
                "./Models/lib/MathModels/ProportionalRelationshipComposite.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "person",
                        {
                            generator: "raw",
                            options: { value: "Sean" },
                        },
                    ],
                    [
                        "recipe",
                        {
                            generator: "raw",
                            options: { value: "bread" },
                        },
                    ],
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
                            options: { min: 5, max: 10 },
                        },
                    ],
                    [
                        "range",
                        {
                            generator: "dynamicRange",
                            options: {
                                min: 3,
                                max: 10,
                                step: 1,
                            },
                        },
                    ],
                    [
                        "z",
                        {
                            generator: "dynamicSample",
                            options: {
                                from: "range",
                                n: 5,
                            },
                        },
                    ],
                    [
                        "w",
                        {
                            generator: "map",
                            options: {
                                vector: "z",
                                expr: "a/b*x_i",
                            },
                        },
                    ],
                    [
                        "y",
                        {
                            generator: "replace",
                            options: {
                                vector: "w",
                                indices: [1, 2],
                                generator: "raw",
                                options: {
                                    value: undefined,
                                },
                            },
                        },
                    ],
                    [
                        "x",
                        {
                            generator: "truncate",
                            options: {
                                n: 3,
                                generator: "map",
                                options: {
                                    vector: "z",
                                    expr: "x_i",
                                },
                            },
                        },
                    ],
                ]),
            ],
        ]),
    ],
    [
        "ProportionalRelationshipCompositeBasicB",
        new Map([
            [
                "moduleUrl",
                "./Models/lib/MathModels/ProportionalRelationshipComposite.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "person",
                        {
                            generator: "raw",
                            options: { value: "Sean" },
                        },
                    ],
                    [
                        "recipe",
                        {
                            generator: "raw",
                            options: { value: "bread" },
                        },
                    ],
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
                            options: { min: 5, max: 10 },
                        },
                    ],
                    [
                        "range",
                        {
                            generator: "dynamicRange",
                            options: {
                                min: 3,
                                max: 10,
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
        "ProportionalRelationshipCompositeIntermediateA",
        new Map([
            [
                "moduleUrl",
                "./Models/lib/MathModels/ProportionalRelationshipComposite.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "person",
                        {
                            generator: "raw",
                            options: { value: "Aiden" },
                        },
                    ],
                    [
                        "fractionof",
                        {
                            generator: "raw",
                            options: { value: true },
                        },
                    ],
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
        "ProportionalRelationshipInverseCompositeIntermediateB",
        new Map([
            [
                "moduleUrl",
                "./Models/lib/MathModels/ProportionalRelationshipComposite.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "person",
                        {
                            generator: "raw",
                            options: { value: "Michael" },
                        },
                    ],
                    [
                        "fractionof",
                        {
                            generator: "raw",
                            options: { value: true },
                        },
                    ],
                    [
                        "showHint",
                        {
                            generator: "raw",
                            options: { value: true },
                        },
                    ],
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
                        "z",
                        {
                            generator: "dynamicSample",
                            options: {
                                from: "range",
                                n: 5,
                            },
                        },
                    ],
                    [
                        "w",
                        {
                            generator: "map",
                            options: {
                                vector: "z",
                                expr: "a/b*x_i",
                            },
                        },
                    ],
                    [
                        "y",
                        {
                            generator: "replace",
                            options: {
                                vector: "w",
                                indices: [1, 2],
                                generator: "raw",
                                options: {
                                    value: undefined,
                                },
                            },
                        },
                    ],
                    [
                        "x",
                        {
                            generator: "truncate",
                            options: {
                                n: 3,
                                generator: "map",
                                options: {
                                    vector: "z",
                                    expr: "x_i",
                                },
                            },
                        },
                    ],
                ]),
            ],
        ]),
    ],
    [
        "ProportionalRelationshipCompositeIntermediateB",
        new Map([
            [
                "moduleUrl",
                "./Models/lib/MathModels/ProportionalRelationshipComposite.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "person",
                        {
                            generator: "raw",
                            options: { value: "Michael" },
                        },
                    ],
                    [
                        "fractionof",
                        {
                            generator: "raw",
                            options: { value: true },
                        },
                    ],
                    [
                        "showHint",
                        {
                            generator: "raw",
                            options: { value: true },
                        },
                    ],
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
        "ProportionalRelationshipCompositeAdvanced",
        new Map([
            [
                "moduleUrl",
                "./Models/lib/MathModels/ProportionalRelationshipComposite.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "person",
                        {
                            generator: "raw",
                            options: { value: "Kobe" },
                        },
                    ],
                    [
                        "recipe",
                        {
                            generator: "raw",
                            options: { value: "hot cocoa" },
                        },
                    ],
                    [
                        "fractionof",
                        {
                            generator: "raw",
                            options: { value: true },
                        },
                    ],
                    [
                        "xlab",
                        {
                            generator: "raw",
                            options: { value: "cocoa" },
                        },
                    ],
                    [
                        "ylab",
                        {
                            generator: "raw",
                            options: { value: "milk" },
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
                        "d",
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
                        "z",
                        {
                            generator: "map",
                            options: {
                                vector: "x",
                                expr: "d*x_i",
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
        "ProportionalRelationshipInverseCompositeAdvanced",
        new Map([
            [
                "moduleUrl",
                "./Models/lib/MathModels/ProportionalRelationshipComposite.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "person",
                        {
                            generator: "raw",
                            options: { value: "Kobe" },
                        },
                    ],
                    [
                        "recipe",
                        {
                            generator: "raw",
                            options: { value: "hot cocoa" },
                        },
                    ],
                    [
                        "fractionof",
                        {
                            generator: "raw",
                            options: { value: true },
                        },
                    ],
                    [
                        "xlab",
                        {
                            generator: "raw",
                            options: { value: "cocoa" },
                        },
                    ],
                    [
                        "ylab",
                        {
                            generator: "raw",
                            options: { value: "milk" },
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
                        "d",
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
                        "z",
                        {
                            generator: "dynamicSample",
                            options: {
                                from: "range",
                                n: 5,
                            },
                        },
                    ],
                    [
                        "w",
                        {
                            generator: "map",
                            options: {
                                vector: "z",
                                expr: "a/b*x_i",
                            },
                        },
                    ],
                    [
                        "y",
                        {
                            generator: "replace",
                            options: {
                                vector: "w",
                                indices: [1, 2],
                                generator: "raw",
                                options: {
                                    value: undefined,
                                },
                            },
                        },
                    ],
                    [
                        "x",
                        {
                            generator: "truncate",
                            options: {
                                n: 3,
                                generator: "map",
                                options: {
                                    vector: "z",
                                    expr: "x_i",
                                },
                            },
                        },
                    ],
                ]),
            ],
        ]),
    ],
    [
        "DoubleNumberLineBasic",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["promptModule", "./Models/lib/MathModels/DoubleNumberLine.js"],
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
                        "d",
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
                        "z",
                        {
                            generator: "map",
                            options: {
                                vector: "x",
                                expr: "d*x_i",
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
        "ProportionalRelationshipQuiz1",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            [
                "tasks",
                [
                    //"ProportionalRelationshipCompositeBasicA",
                    "ProportionalRelationshipCompositeBasicB",
                    "ProportionalRelationshipCompositeIntermediateA",
                    //"ProportionalRelationshipCompositeIntermediateB",
                    "ProportionalRelationshipCompositeAdvanced",
                    /*
                    "DescribeProportionalRelationshipBasic",
                    "DoubleNumberLineBasic",
                    "ProportionalRelationshipTableBasic",
                    "ProportionalRelationshipTableIntermediate",
                    "ProportionalRelationshipTableAdvanced",
                    */
                ],
            ],
            ["labels", ["Basic", "Intermediate", "Advanced"]],
            ["reps", [3, 3, 2]],
            ["directions", ""],
        ]),
    ],
    [
        "ProportionalRelationshipPracticeQuiz2",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            ["services", ["Mathlive"]],
            [
                "tasks",
                [
                    "ProportionalRelationshipCompositeBasicA",
                    "ProportionalRelationshipCompositeBasicB",
                    "ProportionalRelationshipCompositeIntermediateA",
                    //"ProportionalRelationshipCompositeIntermediateB",
                    "ProportionalRelationshipCompositeAdvanced",
                    /*
                    "DescribeProportionalRelationshipBasic",
                    "DoubleNumberLineBasic",
                    "ProportionalRelationshipTableBasic",
                    "ProportionalRelationshipTableIntermediate",
                    "ProportionalRelationshipTableAdvanced",
                    */
                ],
            ],
            ["labels", ["1", "2", "3", "4", "5"]],
            ["reps", [1, 1, 1]],
            ["directions", ""],
        ]),
    ],
    [
        "AreaModelB",
        new Map([
            ["moduleUrl", "./Models/AreaModelSvg.js"],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "person",
                        {
                            generator: "raw",
                            options: { value: "Michael" },
                        },
                    ],
                    [
                        "fractionof",
                        {
                            generator: "raw",
                            options: { value: true },
                        },
                    ],
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
        "ExpressQuantityAsFractionOfAnother",
        new Map([
            [
                "moduleUrl",
                "./Models/lib/MathModels/ExpressQuantityAsFractionOfAnother.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "d",
                        {
                            generator: "randPrime",
                            options: { min: 3, max: 7 },
                        },
                    ],
                    [
                        "p",
                        {
                            generator: "randPrime",
                            options: { min: 3, max: 7 },
                        },
                    ],
                    [
                        "q",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 2, max: "p-1" },
                        },
                    ],
                    [
                        "a",
                        {
                            generator: "eval",
                            options: { expr: "p*d" },
                        },
                    ],
                    [
                        "b",
                        {
                            generator: "eval",
                            options: { expr: "q*d" },
                        },
                    ],
                ]),
            ],
        ]),
    ],
    [
        "ProportionalRelationshipPractice",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            ["services", ["Mathlive", "MathJax", "ParamGenerator"]],
            [
                "tasks",
                new Map([
                    [
                        "Compare",
                        {
                            taskPath: "ExpressQuantityAsFractionOfAnother",
                            label: "Comparing Quantities",
                            reps: 3,
                        },
                    ],
                    [
                        "Basic",
                        {
                            taskPath: "ProportionalRelationshipCompositeBasicB",
                            label: "Basic",
                            reps: 5,
                        },
                    ],
                    [
                        "Intermediate",
                        {
                            taskPath:
                                "ProportionalRelationshipCompositeIntermediateB",
                            label: "Intermediate",
                            reps: 4,
                        },
                    ],
                    [
                        "Advanced",
                        {
                            taskPath:
                                "ProportionalRelationshipCompositeAdvanced",
                            label: "Advanced",
                            reps: 3,
                        },
                    ],
                    //"ProportionalRelationshipCompositeIntermediateA",
                    //"ProportionalRelationshipCompositeIntermediateB",
                    //"ProportionalRelationshipCompositeAdvanced",
                    /*
                    "DescribeProportionalRelationshipBasic",
                    "DoubleNumberLineBasic",
                    "ProportionalRelationshipTableBasic",
                    "ProportionalRelationshipTableIntermediate",
                    "ProportionalRelationshipTableAdvanced",
                    */
                ]),
            ],
            ["directions", ""],
            ["title", "Proportional relationships practice"],
        ]),
    ],
    [
        "ProportionalRelationshipInverse",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            ["services", ["Mathlive", "MathJax", "ParamGenerator"]],
            [
                "tasks",
                new Map([
                    [
                        "Compare",
                        {
                            taskPath: "ExpressQuantityAsFractionOfAnother",
                            label: "Comparing Quantities",
                            reps: 3,
                        },
                    ],
                    [
                        "Basic",
                        {
                            taskPath:
                                "ProportionalRelationshipInverseCompositeBasicB",
                            label: "Basic",
                            reps: 5,
                        },
                    ],
                    [
                        "Intermediate",
                        {
                            taskPath:
                                "ProportionalRelationshipInverseCompositeIntermediateB",
                            label: "Intermediate",
                            reps: 4,
                        },
                    ],
                    [
                        "Advanced",
                        {
                            taskPath:
                                "ProportionalRelationshipInverseCompositeAdvanced",
                            label: "Advanced",
                            reps: 3,
                        },
                    ],
                    //"ProportionalRelationshipCompositeIntermediateA",
                    //"ProportionalRelationshipCompositeIntermediateB",
                    //"ProportionalRelationshipCompositeAdvanced",
                    /*
                    "DescribeProportionalRelationshipBasic",
                    "DoubleNumberLineBasic",
                    "ProportionalRelationshipTableBasic",
                    "ProportionalRelationshipTableIntermediate",
                    "ProportionalRelationshipTableAdvanced",
                    */
                ]),
            ],
            ["directions", ""],
            ["title", "Proportional relationship with inverse operations"],
        ]),
    ],
    [
        "ProportionalOrNonproportionalRelationshipCompositeBasic",
        new Map([
            [
                "moduleUrl",
                "./Models/lib/MathModels/ProportionalOrNonproportionalRelationshipComposite.js",
            ],
            ["services", ["Mathlive", "MathJax", "ParamGenerator"]],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "person",
                        {
                            generator: "raw",
                            options: { value: "Sean" },
                        },
                    ],
                    [
                        "recipe",
                        {
                            generator: "raw",
                            options: { value: "bread" },
                        },
                    ],
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
                            options: { min: 5, max: 10 },
                        },
                    ],
                    [
                        "range",
                        {
                            generator: "dynamicRange",
                            options: {
                                min: 3,
                                max: 10,
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
                                n: 0,
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
        "ProportionalOrNonproportionalRelationshipCompositeIntermediate",
        new Map([
            [
                "moduleUrl",
                "./Models/lib/MathModels/ProportionalOrNonproportionalRelationshipComposite.js",
            ],
            ["services", ["Mathlive", "MathJax", "ParamGenerator"]],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "person",
                        {
                            generator: "raw",
                            options: { value: "Sean" },
                        },
                    ],
                    [
                        "recipe",
                        {
                            generator: "raw",
                            options: { value: "bread" },
                        },
                    ],
                    [
                        "fractionof",
                        {
                            generator: "raw",
                            options: { value: true },
                        },
                    ],
                    [
                        "showHint",
                        {
                            generator: "raw",
                            options: { value: true },
                        },
                    ],
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
                                n: 0,
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
        "ProportionalOrNonproportional",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            ["services", ["Mathlive", "MathJax", "ParamGenerator"]],
            [
                "tasks",
                new Map([
                    [
                        "Basic",
                        {
                            taskPath:
                                "ProportionalOrNonproportionalRelationshipCompositeBasic",
                            label: "Basic",
                            reps: 8,
                        },
                    ],
                    [
                        "Intermediate",
                        {
                            taskPath:
                                "ProportionalOrNonproportionalRelationshipCompositeIntermediate",
                            label: "Intermediate",
                            reps: 3,
                        },
                    ],
                    //"ProportionalRelationshipCompositeIntermediateA",
                    //"ProportionalRelationshipCompositeIntermediateB",
                    //"ProportionalRelationshipCompositeAdvanced",
                    /*
                    "DescribeProportionalRelationshipBasic",
                    "DoubleNumberLineBasic",
                    "ProportionalRelationshipTableBasic",
                    "ProportionalRelationshipTableIntermediate",
                    "ProportionalRelationshipTableAdvanced",
                    */
                ]),
            ],
            ["directions", ""],
            ["title", "Is it proportional?"],
        ]),
    ],
]);
console.log(JSON.stringify(taskParamsMap, mapReplacer));
