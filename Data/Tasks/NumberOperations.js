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
        "InverseFractionOfNumber",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            [
                "tasks",
                [
                    "InverseFractionOfNumberBasic",
                    "InverseFractionOfNumberIntermediate",
                    "InverseFractionOfNumberAdvanced",
                    "InverseFractionOfNumberBasic",
                    "InverseFractionOfNumberIntermediate",
                    "InverseFractionOfNumberAdvanced",
                ],
            ],
            ["labels", ["Basic", "Intermediate", "Advanced", "", "", ""]],
            ["sets", 20],
            ["directions", "Fraction of a number"],
        ]),
    ],
    [
        "InverseFractionOfNumberAssignment",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            [
                "tasks",
                [
                    "InverseFractionOfNumberBasic",
                    "InverseFractionOfNumberBasic",
                    "InverseFractionOfNumberBasic",
                    "InverseFractionOfNumberIntermediate",
                    "InverseFractionOfNumberIntermediate",
                    "InverseFractionOfNumberAdvanced",
                ],
            ],
            [
                "labels",
                [
                    "1 (Basic)",
                    "2",
                    "3",
                    "4 (Intermediate)",
                    "5",
                    "6 (Advanced)",
                ],
            ],
            ["sets", 20],
            [
                "directions",
                "Find the multiplicative inverse: Use a tape diagram to find each amount. Then answer the question about the inverse operation.",
            ],
        ]),
    ],
    [
        "FractionOfNumber",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            [
                "tasks",
                [
                    "FractionOfNumberBasic",
                    //"FractionOfNumberIntermediate",
                    //"FractionOfNumberAdvanced",
                    "FractionOfNumberBasic",
                    //"FractionOfNumberIntermediate",
                    //"FractionOfNumberAdvanced",
                ],
            ],
            ["labels", ["Basic", "Intermediate", "Advanced", "", "", ""]],
            ["sets", 1],
            ["directions", "Fraction of a number"],
        ]),
    ],
    [
        "AddFractions",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            [
                "tasks",
                [
                    "AddFractionsBasic",
                    "AddFractionsIntermediate",
                    "AddFractionsAdvanced",
                    "AddFractionsBasic",
                    "AddFractionsIntermediate",
                    "AddFractionsAdvanced",
                ],
            ],
            ["labels", ["Basic", "Intermediate", "Advanced", "", "", ""]],
            ["sets", 20],
            ["directions", "Add fractions"],
        ]),
    ],
    [
        "AddRationalNumbers",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            [
                "tasks",
                [
                    "AddIntegersNP",
                    "AddBasicFractionsNP",
                    "AddFractionsNP",
                    "AddIntegersNP",
                    "AddBasicFractionsNP",
                    "AddFractionsNP",
                    "AddIntegersNP",
                    "AddBasicFractionsNP",
                    "AddFractionsNP",
                ],
            ],
            [
                "labels",
                ["Basic", "Intermediate", "Advanced", "", "", "", "", "", ""],
            ],
            ["sets", 10],
            [
                "directions",
                "Add positive and negative numbers: Draw a number line and arrows to represent each sum.",
            ],
        ]),
    ],
    [
        "AddAndSubtractRationalNumbers",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            [
                "tasks",
                [
                    "AddIntegersNP",
                    "AddBasicFractionsNP",
                    "AddFractionsNP",
                    "SubtractIntegersNP",
                    "SubtractBasicFractionsNP",
                    "SubtractFractionsNP",
                    "SubtractIntegersNN",
                    "SubtractBasicFractionsNN",
                    "SubtractFractionsNN",
                    "SubtractIntegersPN",
                    "SubtractBasicFractionsPN",
                    "SubtractFractionsPN",
                ],
            ],
            [
                "labels",
                [
                    "Basic",
                    "Intermediate",
                    "Advanced",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                ],
            ],

            [
                "directions",
                "Add and subtract positive and negative numbers: Draw a number line and arrows to represent each sum or difference",
            ],
            ["sets", 10],
        ]),
    ],
    [
        "RewriteDifferenceAsEquivalentSum",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            [
                "tasks",
                [
                    "SubtractIntegersPP",
                    "SubtractBasicFractionsPP",
                    "SubtractFractionsPP",
                    "SubtractIntegersNP",
                    "SubtractBasicFractionsNP",
                    "SubtractFractionsNP",
                    "SubtractIntegersNN",
                    "SubtractBasicFractionsNN",
                    "SubtractFractionsNN",
                ],
            ],
            [
                "labels",
                ["Basic", "Intermediate", "Advanced", "", "", "", "", "", ""],
            ],
            ["sets", 20],
            [
                "directions",
                "Rewrite each difference as an equivalent sum. Draw a number line and arrows to represent each difference.",
            ],
        ]),
    ],
    [
        "InverseFractionOfNumberBasic",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/InverseFractionOfNumber.js",
            ],
            [
                "promptParamsSpec",
                new Map([
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
                        "r",
                        {
                            generator: "dynamicRandInt",
                            options: {
                                min: 1,
                                max: "b-1",
                            },
                        },
                    ],
                    [
                        "d",
                        {
                            generator: "randInt",
                            options: {
                                min: 2,
                                max: 8,
                            },
                        },
                    ],
                    [
                        "n",
                        {
                            generator: "eval",
                            options: {
                                expr: "b*d",
                            },
                        },
                    ],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "InverseFractionOfNumberIntermediate",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/InverseFractionOfNumber.js",
            ],
            [
                "promptParamsSpec",
                new Map([
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
                            options: { min: 2, max: "b" },
                        },
                    ],
                    [
                        "r",
                        {
                            generator: "dynamicRandInt",
                            options: {
                                min: 1,
                                max: "b-1",
                            },
                        },
                    ],
                    [
                        "d",
                        {
                            generator: "randInt",
                            options: {
                                min: 2,
                                max: 8,
                            },
                        },
                    ],
                    [
                        "n",
                        {
                            generator: "eval",
                            options: {
                                expr: "b*d",
                            },
                        },
                    ],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "InverseFractionOfNumberAdvanced",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/InverseFractionOfNumber.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "b",
                        {
                            generator: "randFrom",
                            options: {
                                from: [3, 6, 7, 9],
                            },
                        },
                    ],
                    [
                        "a",
                        {
                            generator: "dynamicRandInt",
                            options: { min: "floor(b/2+1)", max: "b" },
                        },
                    ],
                    [
                        "r",
                        {
                            generator: "dynamicRandInt",
                            options: {
                                min: 1,
                                max: "b-1",
                            },
                        },
                    ],
                    [
                        "d",
                        {
                            generator: "randInt",
                            options: {
                                min: 1,
                                max: 5,
                            },
                        },
                    ],
                    [
                        "n",
                        {
                            generator: "eval",
                            options: {
                                expr: "b*d+r",
                            },
                        },
                    ],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "FractionOfNumberBasic",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["promptModel", "./Models/lib/MathModels/FractionOfNumber.js"],
            ["feedbackModel", "./Models/lib/MathModels/FractionOfNumber.js"],
            [
                "promptParamsSpec",
                new Map([
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
                        "r",
                        {
                            generator: "dynamicRandInt",
                            options: {
                                min: 1,
                                max: "b-1",
                            },
                        },
                    ],
                    [
                        "d",
                        {
                            generator: "randInt",
                            options: {
                                min: 2,
                                max: 8,
                            },
                        },
                    ],
                    [
                        "n",
                        {
                            generator: "eval",
                            options: {
                                expr: "b*d",
                            },
                        },
                    ],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "FractionOfNumberIntermediate",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            ["htmPromptModuleUrl", "./Models/HtmPrompts/FractionOfNumber.js"],
            [
                "promptParamsSpec",
                new Map([
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
                            options: { min: 2, max: "b" },
                        },
                    ],
                    [
                        "r",
                        {
                            generator: "dynamicRandInt",
                            options: {
                                min: 1,
                                max: "b-1",
                            },
                        },
                    ],
                    [
                        "d",
                        {
                            generator: "randInt",
                            options: {
                                min: 2,
                                max: 8,
                            },
                        },
                    ],
                    [
                        "n",
                        {
                            generator: "eval",
                            options: {
                                expr: "b*d",
                            },
                        },
                    ],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "FractionOfNumberAdvanced",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            ["htmPromptModuleUrl", "./Models/HtmPrompts/FractionOfNumber.js"],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "b",
                        {
                            generator: "randFrom",
                            options: {
                                from: [3, 6, 7, 9],
                            },
                        },
                    ],
                    [
                        "a",
                        {
                            generator: "dynamicRandInt",
                            options: { min: "floor(b/2+1)", max: "b" },
                        },
                    ],
                    [
                        "r",
                        {
                            generator: "dynamicRandInt",
                            options: {
                                min: 1,
                                max: "b-1",
                            },
                        },
                    ],
                    [
                        "d",
                        {
                            generator: "randInt",
                            options: {
                                min: 1,
                                max: 5,
                            },
                        },
                    ],
                    [
                        "n",
                        {
                            generator: "eval",
                            options: {
                                expr: "b*d+r",
                            },
                        },
                    ],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "AddFractionsBasic",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "d",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5, 6, 7, 8, 9, 10] },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d" },
                        },
                    ],
                    [
                        "d1",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "AddFractionsIntermediate",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "d1",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5] },
                        },
                    ],
                    [
                        "m",
                        {
                            generator: "randInt",
                            options: { min: 2, max: 3 },
                        },
                    ],
                    [
                        "d",
                        {
                            generator: "eval",
                            options: { expr: "d1*m" },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d1" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d2" },
                        },
                    ],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "AddFractionsAdvanced",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "gcd",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5] },
                        },
                    ],
                    [
                        "m1",
                        {
                            generator: "randPrime",
                            options: { min: 2, max: 3 },
                        },
                    ],
                    [
                        "m2",
                        {
                            generator: "dynamicRandPrime",
                            options: { min: "m1+1", max: 5 },
                        },
                    ],
                    [
                        "d1",
                        {
                            generator: "eval",
                            options: { expr: "gcd*m1" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "gcd*m2" },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d1" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d2" },
                        },
                    ],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "AddFractionsNP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "d1",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5] },
                        },
                    ],
                    [
                        "m",
                        {
                            generator: "randInt",
                            options: { min: 2, max: 3 },
                        },
                    ],
                    [
                        "d",
                        {
                            generator: "eval",
                            options: { expr: "d1*m" },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d1" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d2" },
                        },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractFractionsPP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "d1",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5] },
                        },
                    ],
                    [
                        "m",
                        {
                            generator: "randInt",
                            options: { min: 2, max: 3 },
                        },
                    ],
                    [
                        "d",
                        {
                            generator: "eval",
                            options: { expr: "d1*m" },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d1" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d2" },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractFractionsNP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "d1",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5] },
                        },
                    ],
                    [
                        "m",
                        {
                            generator: "randInt",
                            options: { min: 2, max: 3 },
                        },
                    ],
                    [
                        "d",
                        {
                            generator: "eval",
                            options: { expr: "d1*m" },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d1" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d2" },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractFractionsPN",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "d1",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5] },
                        },
                    ],
                    [
                        "m",
                        {
                            generator: "randInt",
                            options: { min: 2, max: 3 },
                        },
                    ],
                    [
                        "d",
                        {
                            generator: "eval",
                            options: { expr: "d1*m" },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d1" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d2" },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "" } }],
                    ["sign2", { generator: "raw", options: { value: "-" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractFractionsNN",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "d1",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5] },
                        },
                    ],
                    [
                        "m",
                        {
                            generator: "randInt",
                            options: { min: 2, max: 3 },
                        },
                    ],
                    [
                        "d",
                        {
                            generator: "eval",
                            options: { expr: "d1*m" },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d1" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d2" },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "-" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "AddIntegersNP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractIntegersPP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractIntegersNP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractIntegersPN",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "" } }],
                    ["sign2", { generator: "raw", options: { value: "-" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractIntegersNN",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "-" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "AddDecimalsNP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractDecimalsPN",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "" } }],
                    ["sign2", { generator: "raw", options: { value: "-" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractDecimalsPP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractDecimalsNP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractDecimalsNN",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "-" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "AddBasicFractionsNP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "d",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5, 6, 7, 8, 9, 10] },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d" },
                        },
                    ],
                    [
                        "d1",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractBasicFractionsPP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "d",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5, 6, 7, 8, 9, 10] },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d" },
                        },
                    ],
                    [
                        "d1",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractBasicFractionsNP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "d",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5, 6, 7, 8, 9, 10] },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d" },
                        },
                    ],
                    [
                        "d1",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractBasicFractionsPN",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "d",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5, 6, 7, 8, 9, 10] },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d" },
                        },
                    ],
                    [
                        "d1",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "" } }],
                    ["sign2", { generator: "raw", options: { value: "-" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractBasicFractionsNN",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "d",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5, 6, 7, 8, 9, 10] },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d" },
                        },
                    ],
                    [
                        "d1",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "d" },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "-" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "SubtractFractionsAdvancedA",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/AddOrSubtractFractions.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    [
                        "gcd",
                        {
                            generator: "randFrom",
                            options: { from: [3, 4, 5] },
                        },
                    ],
                    [
                        "m1",
                        {
                            generator: "randPrime",
                            options: { min: 2, max: 3 },
                        },
                    ],
                    [
                        "m2",
                        {
                            generator: "dynamicRandPrime",
                            options: { min: "m1+1", max: 5 },
                        },
                    ],
                    [
                        "d1",
                        {
                            generator: "eval",
                            options: { expr: "gcd*m1" },
                        },
                    ],
                    [
                        "d2",
                        {
                            generator: "eval",
                            options: { expr: "gcd*m2" },
                        },
                    ],
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d1" },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: "d2" },
                        },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "-" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "InverseAddOrSubtract",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            [
                "tasks",
                [
                    "InverseAddIntegersNP",
                    "InverseSubtractIntegersNP",
                    "InverseSubtractIntegersNN",
                ],
            ],
            ["labels", ["1 (Basic)", "2", "3"]],

            ["directions", "Find the inverse of adding or subtracting"],
            ["sets", 20],
        ]),
    ],
    [
        "InverseAddIntegersNP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/InverseAddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "InverseSubtractIntegersPP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/InverseAddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "InverseSubtractIntegersNP",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/InverseAddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "InverseSubtractIntegersPN",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/InverseAddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "" } }],
                    ["sign2", { generator: "raw", options: { value: "-" } }],
                ]),
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "InverseSubtractIntegersNN",
        new Map([
            ["moduleUrl", "./Models/MathTask.js"],
            ["mathModel", "./Models/HtmPrompt.js"],
            [
                "htmPromptModuleUrl",
                "./Models/HtmPrompts/InverseAddOrSubtractDecimals.js",
            ],
            [
                "promptParamsSpec",
                new Map([
                    [
                        "n1",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "n2",
                        {
                            generator: "dynamicRandInt",
                            options: { min: 1, max: 50 },
                        },
                    ],
                    [
                        "subtract",
                        { generator: "raw", options: { value: true } },
                    ],
                    ["sign1", { generator: "raw", options: { value: "-" } }],
                    ["sign2", { generator: "raw", options: { value: "-" } }],
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
]);
console.log(JSON.stringify(taskParamsMap, mapReplacer));
