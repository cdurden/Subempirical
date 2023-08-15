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
        "Assignment2",
        new Map([
            ["moduleUrl", "./Models/SerialComposite.js"],
            [
                "tasks",
                [
                    "Factor3ParamTrinomialFITBExample1",
                    "AreaModelFactorTrinomialExample1",
                    "Factor3ParamTrinomialFITBExample2",
                    "AreaModelFactorTrinomialExample2",
                    "Factor3ParamTrinomialFITBExample3",
                    "AreaModelFactorTrinomial",
                    "AreaModelFactorTrinomial",
                    "AreaModelFactorTrinomial",
                    "AreaModelFactorTrinomial",
                    "Factor3ParamTrinomialFITB",
                    "Factor3ParamTrinomialFITB",
                    "Factor3ParamTrinomialFITB",
                    "Factor3ParamTrinomial",
                    "Factor3ParamTrinomial",
                    "Factor3ParamTrinomial",
                    //"Factor4ParamTrinomialFITBExample1",
                    //"Factor4ParamTrinomialFITB",
                    //"AreaModelFactorMonicTrinomial",
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
                "/Data/WheelOfLife/Teaching.json",
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
                                    min: 1,
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
                                options: { min: 1, max: 10 },
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
            ["value", "(x+\\placeholder[a]{})(x+\\placeholder[b]{})"],
            ["fill-in-the-blank", true],
            ["responseFields", ["a"]],
            ["type", "factor"],
        ]),
    ],
    [
        "Factor3ParamTrinomialFITBExample1",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((a*x+b)*(x+c))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { min: 3, max: 3 },
                            },
                        ],
                        [
                            "b",
                            {
                                generator: "randInt",
                                options: {
                                    min: 1,
                                    max: 1,
                                },
                            },
                        ],
                        [
                            "c",
                            {
                                generator: "randInt",
                                options: {
                                    min: 1,
                                    max: 1,
                                },
                            },
                        ],
                    ]),
                },
            ],
            [
                "value",
                "(\\placeholder[a]{}x+\\placeholder[b]{})(x+\\placeholder[c]{})",
            ],
            ["fill-in-the-blank", true],
            ["responseFields", ["a", "b", "c"]],
            ["type", "factor"],
        ]),
    ],
    [
        "Factor3ParamTrinomialFITBExample2",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((a*x+b)*(x+c))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { min: 3, max: 3 },
                            },
                        ],
                        [
                            "b",
                            {
                                generator: "randInt",
                                options: {
                                    min: 1,
                                    max: 1,
                                },
                            },
                        ],
                        [
                            "c",
                            {
                                generator: "randInt",
                                options: {
                                    min: 5,
                                    max: 5,
                                },
                            },
                        ],
                    ]),
                },
            ],
            [
                "value",
                "(\\placeholder[a]{}x+\\placeholder[b]{})(x+\\placeholder[c]{})",
            ],
            ["fill-in-the-blank", true],
            ["responseFields", ["a", "b", "c"]],
            ["type", "factor"],
        ]),
    ],
    [
        "Factor3ParamTrinomialFITBExample3",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((a*x+b)*(x+c))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { min: 2, max: 2 },
                            },
                        ],
                        [
                            "b",
                            {
                                generator: "randInt",
                                options: {
                                    min: 3,
                                    max: 3,
                                },
                            },
                        ],
                        [
                            "c",
                            {
                                generator: "randInt",
                                options: {
                                    min: 5,
                                    max: 5,
                                },
                            },
                        ],
                    ]),
                },
            ],
            [
                "value",
                "(\\placeholder[a]{}x+\\placeholder[b]{})(x+\\placeholder[c]{})",
            ],
            ["fill-in-the-blank", true],
            ["responseFields", ["a", "b", "c"]],
            ["type", "factor"],
        ]),
    ],
    [
        "Factor3ParamTrinomialFITB",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((a*x+b)*(x+c))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randPrime",
                                options: { min: 2, max: 10 },
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
                        [
                            "c",
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
            [
                "value",
                "(\\placeholder[a]{}x+\\placeholder[b]{})(x+\\placeholder[c]{})",
            ],
            ["fill-in-the-blank", true],
            ["responseFields", ["a", "b", "c"]],
            ["type", "factor"],
        ]),
    ],
    [
        "Factor3ParamTrinomial",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((a*x+b)*(x+c))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randPrime",
                                options: { min: 2, max: 10 },
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
                        [
                            "c",
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
            ["type", "factor"],
        ]),
    ],
    [
        "Factor4ParamTrinomialFITBExample1",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((a*x+b)*(c*x+d))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { min: 2, max: 2 },
                            },
                        ],
                        [
                            "b",
                            {
                                generator: "randInt",
                                options: {
                                    min: 1,
                                    max: 1,
                                },
                            },
                        ],
                        [
                            "c",
                            {
                                generator: "randInt",
                                options: {
                                    min: 3,
                                    max: 3,
                                },
                            },
                        ],
                        [
                            "d",
                            {
                                generator: "randInt",
                                options: {
                                    min: 5,
                                    max: 5,
                                },
                            },
                        ],
                    ]),
                },
            ],
            [
                "value",
                "(\\placeholder[a]{}x+\\placeholder[b]{})(\\placeholder[c]{}x+\\placeholder[d]{})",
            ],
            ["fill-in-the-blank", true],
            ["responseFields", ["a", "b", "c", "d"]],
            ["type", "factor"],
        ]),
    ],
    [
        "Factor4ParamTrinomialFITB",
        new Map([
            ["moduleUrl", "./Models/MathliveField.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((a*x+b)*(c*x+d))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { min: 2, max: 10 },
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
                        [
                            "c",
                            {
                                generator: "randInt",
                                options: {
                                    min: 3,
                                    max: 10,
                                },
                            },
                        ],
                        [
                            "d",
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
            [
                "value",
                "(\\placeholder[a]{}x+\\placeholder[b]{})(\\placeholder[c]{}x+\\placeholder[d]{})",
            ],
            ["fill-in-the-blank", true],
            ["responseFields", ["a", "b", "c", "d"]],
            ["type", "factor"],
        ]),
    ],
    [
        "AreaModelFactorTrinomialExample1",
        new Map([
            ["moduleUrl", "./Models/AreaModel.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((a*x+b)*(x+c))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { min: 5, max: 5 },
                            },
                        ],
                        [
                            "b",
                            {
                                generator: "randInt",
                                options: {
                                    min: 3,
                                    max: 3,
                                },
                            },
                        ],
                        [
                            "c",
                            {
                                generator: "randInt",
                                options: {
                                    min: 1,
                                    max: 1,
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
        "AreaModelFactorTrinomialExample2",
        new Map([
            ["moduleUrl", "./Models/AreaModel.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((a*x+b)*(x+c))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randInt",
                                options: { min: 7, max: 7 },
                            },
                        ],
                        [
                            "b",
                            {
                                generator: "randInt",
                                options: {
                                    min: 1,
                                    max: 1,
                                },
                            },
                        ],
                        [
                            "c",
                            {
                                generator: "randInt",
                                options: {
                                    min: 2,
                                    max: 2,
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
        "AreaModelFactorMonicTrinomial",
        new Map([
            ["moduleUrl", "./Models/AreaModel.js"],
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
            ["type", "factor"],
        ]),
    ],
    [
        "AreaModelFactorTrinomial",
        new Map([
            ["moduleUrl", "./Models/AreaModel.js"],
            ["mathModel", "./Models/MathExpression.js"],
            [
                "expressionSpec",
                {
                    template: "expand((a*x+b)*(x+c))",
                    eval: true,
                    params: new Map([
                        [
                            "a",
                            {
                                generator: "randPrime",
                                options: { min: 2, max: 10 },
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
                        [
                            "c",
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
            ["type", "factor"],
        ]),
    ],
]);
console.log(JSON.stringify(taskParamsMap, mapReplacer));
