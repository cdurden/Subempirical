import { all, loadScript } from "../lib/common.js";

function evaluate(expr, params) {
    return Algebrite.eval(
        Array.from(Object.entries(params)).reduce(function (
            accumulatorExpr,
            [fieldName, value]
        ) {
            return Algebrite_subst(
                accumulatorExpr,
                Algebrite.parse(fieldName),
                Algebrite.parse(value)
            );
        },
        Algebrite.parse(expr))
    ).toString();
}

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
function isEqual(exprA, exprB) {
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
function isZero(expr) {
    return isEqual(expr, "0");
}
function evalsToZero(expr, params) {
    return isEqual(evaluate(expr, params), "0");
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
function generateFeedback(h, update) {
    return Promise.all([
        loadResource("Algebrite"),
        loadResource("Algebra-latex"),
    ]).then(function ([algebriteModule, algebraLatexModule]) {
        return h("div", {}, [h("p", {}, `Feedback`)]);
    });
}
function Model(paramsMap) {
    const params = paramsMap.get("params") ?? {};
    const checkerMethod = paramsMap.get("checkerMethod");
    function check(response) {
        const checkerModuleUrl = "../../AlgebriteChecker.js";
        const checkerArguments = ["response-a/b*n"];
        return import(checkerModuleUrl).then(function (checkerModule) {
            const evaluatedCheckerArguments = checkerArguments.map(function (
                expr
            ) {
                return checkerModule.evaluate(expr, {
                    response,
                    ...params,
                });
            });
            return checkerModule[checkerMethod](...evaluatedCheckerArguments);
        });
    }
    return { check, params };
}
function View(model, update) {
    const children = [];
    const rootElement = document.createElement("div");
    function render(preact) {
        preact.render(virtualDom(preact), rootElement);
        update({ action: "typeset", element: rootElement });
    }
    function virtualDom(preact) {
        const { a, b, m, n } = model.params;
        const h = preact.h;
        const mathField = h("math-field", {
            id: "mathInput",
            "math-virtual-keyboard-policy": "sandboxed",
        });
        return h("div", {}, [
            h("p", {}, `Find \$ \\frac{${a}}{${b}} \$ of \$ ${n} \$`),
            //generateFeedback(),
            children.map(function (child) {
                child.view.virtualDom();
            }),
            h("p", { id: "feedbackMessage" }, `Feedback:`),
            mathField,
            h(
                "button",
                {
                    onClick: function () {
                        const response = document.getElementById("mathInput")
                            .value;
                        /*
                        const correct = model.check(response);
                        children.map(function (child) {
                            child.update({ action: "setCorrect", correct });
                        });
                        */
                        update({
                            action: "submit",
                            data: response,
                        });
                    },
                },
                "Submit"
            ),
        ]);
    }
    function addChild(child) {
        children.push(child);
    }
    return { rootElement, render, addChild, virtualDom };
}
function init(paramsMap, updateParent) {
    const model = Model(paramsMap);
    const view = new View(model, update);
    function update(message) {
        if (message.action === "addChild") {
            view.addChild(message.child);
        }
        updateParent(message);
    }
    return Promise.resolve({ model, view, update });
}

export { init };

export { isEqual, isZero, evaluate, evalsToZero };
