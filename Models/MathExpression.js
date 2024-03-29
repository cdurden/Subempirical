import { all, loadScript } from "../lib/common.js";

function randInt(rand, { min, max }) {
    return Math.floor(rand() * (max - (min ?? 0))) + (min ?? 0);
}

const allPrimes = [2, 3, 5, 7, 11, 13];
function randPrime(rand, { max, primes, sign }) {
    const candidates = (primes ?? allPrimes).filter(function (n) {
        return n <= max;
    });
    return candidates[(sign ?? 1) * randInt(rand, { max: candidates.length })];
}

function zip(x, y) {
    return x.map(function (entry, index) {
        return [x[index], y[index]];
    });
}

// Return the minimum composite number, composed
// of primes with the given multiplicities
function minComposite(primes, multiplicities) {
    return zip(primes, multiplicities).reduce(function (
        accumulator,
        [p, multiplicity]
    ) {
        return accumulator * p ** multiplicity;
    },
    1);
}

function randComposite(rand, { sign, multiplicities, max }) {
    var n = 1;
    const unusedPrimes = allPrimes;
    multiplicities.map(function (multiplicity, index) {
        const p = randPrime(rand, {
            max: Math.max(
                ...unusedPrimes.filter(function (q) {
                    return (
                        q ** multiplicity <
                        max /
                            (n *
                                minComposite(
                                    unusedPrimes.slice(
                                        0,
                                        multiplicities.length - (index + 1)
                                    ),
                                    multiplicities.slice(index + 1)
                                ))
                    );
                })
            ),
            primes: unusedPrimes,
        });
        unusedPrimes.splice(unusedPrimes.indexOf(p), 1);
        n *= p ** multiplicity;
    });
    return (sign ?? 1) * n;
}

const paramGenerators = new Map([
    [
        "rand",
        function (rand) {
            return rand();
        },
    ],
    ["randInt", randInt],
    ["randPrime", randPrime],
    ["randComposite", randComposite],
]);

function View(model, update) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    function render() {
        return Promise.resolve();
    }
    return Object.assign(self, {
        render,
    });
}
function simplify(expression) {
    return Algebrite.simplify(expression);
}
function isSimplified(expression) {
    try {
        return (
            Algebrite.length(expression) <=
            Algebrite.length(Algebrite.simplify(expression))
        );
    } catch (e) {
        return false;
    }
}
function equal(exprA, exprB) {
    try {
        return Algebrite.equal(
            Algebrite.simplify(
                Algebrite.parse(
                    exprA.toString() + "-(" + exprB.toString() + ")"
                )
            ),
            Algebrite.parse("0")
        );
        /*
        return Algebrite.equal(
            Algebrite.simplify(exprA),
            Algebrite.simplify(exprB)
        );
        */
    } catch (e) {
        return false;
    }
}
function generateParam(paramSpec, rand) {
    return paramGenerators.get(paramSpec.generator)(
        rand,
        paramSpec.options ?? {}
    );
}

function Algebrite_subst(expr, oldExpr, newExpr) {
    /*
    if (
        oldExpr === symbol_1.symbol(defs_1.NIL) ||
        newExpr === symbol_1.symbol(defs_1.NIL)
    ) {
        return expr;
    }
    */
    if (Algebrite.equal(expr, oldExpr)) {
        return newExpr;
    }
    if (Algebrite.iscons(expr)) {
        expr.cons.car = Algebrite_subst(Algebrite.car(expr), oldExpr, newExpr);
        expr.cons.cdr = Algebrite_subst(Algebrite.cdr(expr), oldExpr, newExpr);
    }
    return expr;
}

function substitute(paramsMap, expression) {
    return Array.from(paramsMap.entries()).reduce(function (
        accumulatorExpression,
        [varName, paramSpec]
    ) {
        return Algebrite_subst(
            accumulatorExpression,
            Algebrite.parse(varName),
            Algebrite.parse(paramsMap.get(varName))
        );
        return Algebrite.subst(
            paramsMap.get(varName),
            varName,
            accumulatorExpression
        );
    },
    expression);
}
function generateParams(expressionSpec, rand) {
    return new Map(
        Array.from(expressionSpec.params.entries()).map(function ([
            varName,
            paramSpec,
        ]) {
            return [varName, generateParam(paramSpec, rand)];
        })
    );
}
function generateExpression(expressionSpec, expressionParams) {
    const expression = substitute(
        expressionParams,
        Algebrite.parse(expressionSpec.template)
    );
    if (expressionSpec.eval) {
        return Algebrite.eval(expression);
    } else {
        return expression;
    }
}

function Model(paramsMap) {
    const expressionSpec = paramsMap.get("expressionSpec");
    const rand = paramsMap.get("rand");
    /*
    mulberry32(
        cyrb128(
            `${paramsMap.get("expressionSpec").template}${paramsMap.get(
                "seed"
            )}`
        )[0]
    );
    */
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const expressionParams = generateParams(
        paramsMap.get("expressionSpec"),
        rand
    );
    const parsedExpression = generateExpression(
        paramsMap.get("expressionSpec"),
        expressionParams
    );
    const data = {
        expression: parsedExpression.toString(),
    };
    function validate(response) {
        var parsedResponse;
        if (response instanceof Map) {
            parsedResponse = Algebrite.eval(
                Array.from(response.entries()).reduce(function (
                    accumulatorExpr,
                    [fieldName, value]
                ) {
                    return Algebrite_subst(
                        accumulatorExpr,
                        Algebrite.parse(fieldName),
                        Algebrite.parse(value)
                    );
                },
                Algebrite.parse(expressionSpec.template))
            );
            return equal(parsedExpression, parsedResponse);
            /*
            return all(
                Array.from(response.entries()).map(function ([
                    fieldName,
                    value,
                ]) {
                    return Algebrite.equal(
                        Algebrite.parse(value),
                        Algebrite.parse(expressionParams.get(fieldName))
                    );
                })
            );
            */
        }
        try {
            parsedResponse = Algebrite.parse(
                new AlgebraLatex().parseLatex(response).toMath()
            );
        } catch (e) {
            return false;
        }
        if (paramsMap.get("type") === "simplify") {
            return (
                Algebrite.isadd(parsedResponse) &&
                equal(parsedExpression, parsedResponse) &&
                isSimplified(parsedResponse)
            );
        } else if (paramsMap.get("type") === "factor") {
            /*
            var expr1 = KAS.parse(response).expr;
            var expr2 = KAS.parse(data.expression).expr;
            return KAS.compare(expr1, expr2).equal;
            */
            return (
                (Algebrite.ismultiply(parsedResponse) ||
                    (Algebrite.ispower(parsedResponse) &&
                        parsedResponse.cons.cdr.cons.cdr.cons.car.toString() !==
                            "1")) &&
                equal(parsedExpression, parsedResponse)
            );
        } else {
            return false;
        }
    }
    function prompt() {
        if (paramsMap.get("type") === "simplify") {
            return `Simplify \$${parsedExpression.toLatexString()}\$`;
        } else if (paramsMap.get("type") === "factor") {
            return `Factor \$${parsedExpression.toLatexString()}\$`;
        }
    }
    return Promise.resolve(
        Object.assign(self, {
            data,
            prompt,
            validate,
        })
    );
}
function init(
    paramsMap,
    updateParent = function () {
        return Promise.resolve();
    }
) {
    const scriptSourceMap = new Map([
        [
            "localhost",
            [
                "./lib/algebrite.bundle-for-browser-min.js",
                "./lib/algebra-latex.js",
            ],
        ],
        [
            "other",
            [
                "./lib/algebrite.bundle-for-browser-min.js",
                "./lib/algebra-latex.js",
            ],
        ],
    ]);
    const hostname = window.location.hostname;
    const scriptSource = scriptSourceMap.has(hostname) ? hostname : "other";
    return Promise.all(
        scriptSourceMap.get(scriptSource).map(function (script) {
            return loadScript(script, { baseURL: paramsMap.get("baseURL") });
        })
    ).then(function (modules) {
        return new Model(paramsMap).then(function (model) {
            const view = new View(model, update);
            function update(message) {
                if (message.action === "updateModel") {
                    model.data.response = message.response;
                }
                return true;
            }
            updateParent({
                action: "setValidator",
                validate: model.validate,
            });
            updateParent({
                action: "addEventListener",
                eventName: "mounted",
                listener: function () {
                        /*
                    MathJax.startup.promise.then(() => {
                        if (document.readyState === "loading") {
                            // Loading hasn't finished yet
                            document.addEventListener(
                                "DOMContentLoaded",
                                view.typesetPrompt
                            );
                        } else {
                            // `DOMContentLoaded` has already fired
                            view.typesetPrompt();
                        }
                    });
                        */
                },
            });

            return {
                model,
                view,
                update,
            };
        });
    });
}

export { init };
