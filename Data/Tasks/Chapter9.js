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
        "Course1",
        new Map([
            ["moduleUrl", "./Models/CourseGraph.js"],
            ["graphUrl", "/Data/Graphs/Course1.dot"],
            ["submissions", [["", "", "GoalCheck1"]]],
        ]),
    ],
    [
        "Assignment1",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            [
                "tasks",
                [
                    "ExpandMonicBinomialProduct",
                    "ExpandMonicBinomialProductOneNegative",
                    "FactorMonicTrinomialFITB",
                    "FactorMonicTrinomial",
                    "FactorMonicTrinomial",
                    "FactorMonicPerfectSquareTrinomial",
                    "FactorMonicTrinomialOneNegative",
                    "FactorMonicTrinomialTwoNegatives",
                    "FactorMonicTrinomialOneNegative",
                    "FactorMonicPerfectSquareTrinomialNegative",
                ],
            ],
        ]),
    ],
    [
        "GoalCheck1",
        new Map([
            ["moduleUrl", "./Models/WheelOfLife.js"],
            ["file", "/Data/WheelOfLife/Original.json"],
        ]),
    ],
    [
        "TeachingGoals",
        new Map([
            ["moduleUrl", "./Models/WheelOfLife.js"],
            [
                "file",
                "https://raw.githubusercontent.com/cdurden/Subempirical/main/Data/WheelOfLife/Teaching.json",
            ],
        ]),
    ],
    [
        "ExpandMonicBinomialProduct",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "(x+a)*(x+b)",
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { min: 1, max: 10 },
                            },
                        ],
                        [
                            "b",
                            {
                                generator: "randInt",
                                options: {
                                    min: 1,
                                    max: 10,
                                },
                            },
                        ],
                    ]),
                },
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "ExpandMonicBinomialProductOneNegative",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "(x+a)*(x+b)",
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { min: -10, max: -1 },
                            },
                        ],
                        [
                            "b",
                            {
                                generator: "randInt",
                                options: {
                                    min: 1,
                                    max: 10,
                                },
                            },
                        ],
                    ]),
                },
            ],
            ["type", "simplify"],
        ]),
    ],
    [
        "FactorMonicTrinomial",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((x+a)*(x+b))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { max: 10 },
                            },
                        ],
                        [
                            "b",
                            {
                                generator: "randInt",
                                options: {
                                    max: 10,
                                },
                            },
                        ],
                    ]),
                },
            ],
            ["type", "factor"],
        ]),
    ],
    [
        "FactorMonicTrinomialOneNegative",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((x+a)*(x+b))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { min: -10, max: -1 },
                            },
                        ],
                        [
                            "b",
                            {
                                generator: "randInt",
                                options: {
                                    max: 10,
                                },
                            },
                        ],
                    ]),
                },
            ],
            ["type", "factor"],
        ]),
    ],
    [
        "FactorMonicTrinomialTwoNegatives",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((x+a)*(x+b))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { min: -10, max: -1 },
                            },
                        ],
                        [
                            "b",
                            {
                                generator: "randInt",
                                options: { min: -10, max: -1 },
                            },
                        ],
                    ]),
                },
            ],
            ["type", "factor"],
        ]),
    ],
    [
        "FactorMonicPerfectSquareTrinomial",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((x+a)^2)",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { max: 10 },
                            },
                        ],
                    ]),
                },
            ],
            ["type", "factor"],
        ]),
    ],
    [
        "FactorMonicPerfectSquareTrinomialNegative",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((x+a)^2)",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { min: -10, max: -1 },
                            },
                        ],
                    ]),
                },
            ],
            ["type", "factor"],
        ]),
    ],
    [
        "FactorMonicTrinomialFITB",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((x+a)*(x+b))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { max: 10 },
                            },
                        ],
                        [
                            "b",
                            {
                                generator: "randInt",
                                options: {
                                    max: 10,
                                },
                            },
                        ],
                    ]),
                },
            ],
            ["value", "(x+\\placeholder[a]{})(x+\\placeholder[b]{})"],
            ["fill-in-the-blank", true],
            ["responseFields", ["a"]],
            ["type", "factor"],
        ]),
    ],
]);
console.log(JSON.stringify(taskParamsMap, mapReplacer));
