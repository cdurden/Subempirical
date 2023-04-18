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

const repoBaseUrl = "https://localhost:1024";
const taskParamsMap = new Map([
    [
        "Course1",
        new Map([
            ["repoBaseUrl", repoBaseUrl],
            ["moduleUrl", new URL("/Models/CourseGraph.js", repoBaseUrl).href],
            ["graphUrl", "/Data/Graphs/Course1.dot"],
            ["submissions", [["", "", "GoalCheck1"]]],
        ]),
    ],
    [
        "Assignment1",
        new Map([
            ["repoBaseUrl", repoBaseUrl],
            [
                "moduleUrl",
                new URL("/Models/SerialComposite.js", repoBaseUrl).href,
            ],
            [
                "tasks",
                [
                    "ExpandMonicBinomialProduct",
                    "ExpandMonicBinomialProductOneNegative",
                    "FactorMonicPerfectSquareTrinomialFITB",
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
            ["repoBaseUrl", repoBaseUrl],
            ["moduleUrl", new URL("/Models/WheelOfLife.js", repoBaseUrl).href],
            ["file", "/Data/WheelOfLife/Original.json"],
        ]),
    ],
    [
        "TeachingGoals",
        new Map([
            ["repoBaseUrl", repoBaseUrl],
            ["moduleUrl", `${repoBaseUrl}/Models/WheelOfLife.js`],
            [
                "file",
                "https://raw.githubusercontent.com/cdurden/Subempirical/main/Data/WheelOfLife/Teaching.json",
            ],
        ]),
    ],
    [
        "ExpandMonicBinomialProduct",
        new Map([
            ["repoBaseUrl", repoBaseUrl],
            [
                "moduleUrl",
                new URL("/Models/MathliveField.js", repoBaseUrl).href,
            ],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "(x-a)*(x-b)",
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
            ["type", "simplify"],
        ]),
    ],
    [
        "ExpandMonicBinomialProductOneNegative",
        new Map([
            ["repoBaseUrl", repoBaseUrl],
            [
                "moduleUrl",
                new URL("/Models/MathliveField.js", repoBaseUrl).href,
            ],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "(x-a)*(x-b)",
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { max: 10, sign: -1 },
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
            ["type", "simplify"],
        ]),
    ],
    [
        "FactorMonicTrinomial",
        new Map([
            ["repoBaseUrl", repoBaseUrl],
            [
                "moduleUrl",
                new URL("/Models/MathliveField.js", repoBaseUrl).href,
            ],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((x-a)*(x-b))",
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
            ["repoBaseUrl", repoBaseUrl],
            [
                "moduleUrl",
                new URL("/Models/MathliveField.js", repoBaseUrl).href,
            ],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((x-a)*(x-b))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { max: 10, sign: -1 },
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
            ["repoBaseUrl", repoBaseUrl],
            [
                "moduleUrl",
                new URL("/Models/MathliveField.js", repoBaseUrl).href,
            ],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((x-a)*(x-b))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { max: 10, sign: -1 },
                            },
                        ],
                        [
                            "b",
                            {
                                generator: "randInt",
                                options: {
                                    max: 10,
                                    sign: -1,
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
        "FactorMonicPerfectSquareTrinomial",
        new Map([
            ["repoBaseUrl", repoBaseUrl],
            [
                "moduleUrl",
                new URL("/Models/MathliveField.js", repoBaseUrl).href,
            ],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((x-a)^2)",
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
            ["repoBaseUrl", repoBaseUrl],
            [
                "moduleUrl",
                new URL("/Models/MathliveField.js", repoBaseUrl).href,
            ],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((x-a)^2)",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { max: 10, sign: -1 },
                            },
                        ],
                    ]),
                },
            ],
            ["type", "factor"],
        ]),
    ],
    [
        "FactorMonicPerfectSquareTrinomialFITB",
        new Map([
            ["repoBaseUrl", repoBaseUrl],
            [
                "moduleUrl",
                new URL("/Models/MathliveField.js", repoBaseUrl).href,
            ],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((x-a)^2)",
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
            ["value", "(x-\\placeholder[a]{})^2"],
            ["fill-in-the-blank", true],
            ["responseFields", ["a"]],
            ["type", "factor"],
        ]),
    ],
]);
console.log(JSON.stringify(taskParamsMap, mapReplacer));
