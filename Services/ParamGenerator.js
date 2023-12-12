import { all, loadResource } from "../lib/common.js";

function evaluate(rand, { expr }, params) {
    return Algebrite.eval(
        Array.from(Object.entries(params)).reduce(function (
            accumulatorExpr,
            [fieldName, value]
        ) {
            if (value === undefined || value instanceof Array) {
                return accumulatorExpr;
            }
            return Algebrite_subst(
                accumulatorExpr,
                Algebrite.parse(fieldName),
                Algebrite.parse(value)
            );
        },
        Algebrite.parse(expr))
    ).toString();
}

function dynamicRand(fn, rand, options, params) {
    return fn(
        rand,
        Object.fromEntries(
            Object.entries(options).map(function ([key, value]) {
                return [key, Number(evaluate(rand, { expr: value }, params))];
            })
        )
    );
}
function raw(rand, { value }) {
    return value;
}
function truncate(rand, options, params) {
    return paramGenerators
        .get(options.generator)(rand, options.options, params)
        .slice(0, options.n);
}
function replace(rand, options, params) {
    return params[options.vector].map(function (element, index) {
        if (options.indices.includes(index)) {
            return paramGenerators.get(options.generator)(
                rand,
                options.options,
                params
            );
        } else {
            return element;
        }
    });
}
function map(rand, options, params) {
    const y = [];
    const n = params[options.vector].length;
    for (let i = 0; i < n; i++) {
        y.push(
            evaluate(rand, options, {
                x_i: params[options.vector][i],
                ...params,
            })
        );
    }
    return y;
}
function range(rand, { min, max, step }, params) {
    const x = [];
    for (let i = 0; i * step < max; i++) {
        x.push(min + i * step);
    }
    return x;
}
function dynamicRange(...args) {
    return dynamicRand(range, ...args);
}
function vector(rand, options, params) {
    const x = [];
    for (let i = 0; i < options.n; i++) {
        x.push(
            paramGenerators.get(options.generator)(
                rand,
                options.options,
                params
            )
        );
    }
    return x;
}
function dynamicSample(rand, { from, n }, params) {
    return sample(rand, { from: params[from], n }, params);
}
function sample(rand, { from, n }, params) {
    return [
        ...from.splice(randInt(rand, { min: 0, max: from.length - 1 }), 1),
        ...(n > 1 ? sample(rand, { n: n - 1, from }) : []),
    ];
}
function dynamicRandInt(...args) {
    return dynamicRand(randInt, ...args);
}
function dynamicRandPrime(...args) {
    return dynamicRand(randPrime, ...args);
}
function randInt(rand, { min, max }) {
    return Math.floor(rand() * (max - (min ?? 0))) + (min ?? 0);
}

function randFrom(rand, { from }) {
    return from[randInt(rand, { max: from.length })];
}
const allPrimes = [2, 3, 5, 7, 11, 13];
function randPrime(rand, { min, max, primes, sign }) {
    const candidates = (primes ?? allPrimes).filter(function (n) {
        return n <= max && n >= (min ?? 1);
    });
    return candidates[(sign ?? 1) * randInt(rand, { max: candidates.length })];
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
    ["vector", vector],
    ["range", range],
    ["dynamicRange", dynamicRange],
    ["map", map],
    ["truncate", truncate],
    ["replace", replace],
    ["sample", sample],
    ["dynamicSample", dynamicSample],
    ["dynamicRandPrime", dynamicRandPrime],
    ["dynamicRandInt", dynamicRandInt],
    ["randFrom", randFrom],
    ["randInt", randInt],
    ["randPrime", randPrime],
    ["randComposite", randComposite],
    ["eval", evaluate],
    ["raw", raw],
]);

function View(model, update) {
    const self = Object.create(null);
    const rootElement = document.createElement("div");
    Object.setPrototypeOf(self, View.prototype);
    function render() {
        return Promise.resolve();
    }
    return Object.assign(self, {
        rootElement,
        render,
    });
}
function generateParam(paramSpec, rand, params) {
    return paramGenerators.get(paramSpec.generator)(
        rand,
        paramSpec.options ?? {},
        params ?? {}
    );
}

function Algebrite_subst(expr, oldExpr, newExpr) {
    if (Algebrite.equal(expr, oldExpr)) {
        return newExpr;
    }
    if (Algebrite.iscons(expr)) {
        expr.cons.car = Algebrite_subst(Algebrite.car(expr), oldExpr, newExpr);
        expr.cons.cdr = Algebrite_subst(Algebrite.cdr(expr), oldExpr, newExpr);
    }
    return expr;
}

function generateParams(promptParamsSpec, rand) {
    return Object.fromEntries(
        Array.from(promptParamsSpec.entries()).reduce(function (
            paramsAcc,
            [varName, paramSpec]
        ) {
            return [
                ...paramsAcc,
                [
                    varName,
                    generateParam(
                        paramSpec,
                        rand,
                        Object.fromEntries(paramsAcc)
                    ),
                ],
            ];
        },
        [])
    );
}

function Model(paramsMap) {
    const html = paramsMap.get("html");
    const promptParamsSpec = paramsMap.get("promptParamsSpec");
    const rand = paramsMap.get("rand");
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const params = generateParams(paramsMap.get("promptParamsSpec"), rand);
    return Promise.resolve(
        Object.assign(self, {
            params,
        })
    );
}
function init(paramsMap, updateParentServices) {
    const rand = paramsMap.get("rand");
    return Promise.all(
        ["Algebrite"].map(function (prereq) {
            return loadResource(prereq, { baseURL: paramsMap.get("baseURL") });
        })
    ).then(function ([algebriteModule]) {
        function update(message) {
            if (message.action === "generateParams") {
                return Promise.resolve(
                    generateParams(message.paramsSpec, rand)
                );
            }
            return Promise.resolve();
        }

        return update;
    });
}

export { init };
