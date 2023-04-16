import { getFile } from "./common.js";
function stringTemplateParser(expression, valueObj) {
    const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
    let text = expression.replace(
        templateMatcher,
        (substring, value, index) => {
            value = valueObj.get(value);
            return value;
        }
    );
    return text;
}
function cyrb128(str) {
    let h1 = 1779033703,
        h2 = 3144134277,
        h3 = 1013904242,
        h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [
        (h1 ^ h2 ^ h3 ^ h4) >>> 0,
        (h2 ^ h1) >>> 0,
        (h3 ^ h1) >>> 0,
        (h4 ^ h1) >>> 0,
    ];
}
function mulberry32(a) {
    return function () {
        var t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function randInt(rand, { max }) {
    return Math.floor(rand() * max);
}

const allPrimes = [2, 3, 5, 7, 11, 13];
function randPrime(rand, { max, primes }) {
    const candidates = (primes ?? allPrimes).filter(function (n) {
        return n <= max;
    });
    return candidates[randInt(rand, { max: candidates.length })];
}

function sum(values) {
    return values.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
    );
}

function dot(x, y) {
    return sum(
        x.map(function (entry, index) {
            return x[index] * y[index];
        })
    );
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

function randComposite(rand, { multiplicities, max }) {
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
    return n;
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
function getPrompt(paramsMap) {
    const promptsDataUrl = new URL(
        paramsMap.get("promptTemplates") ?? "./Data/MathPrompts/default.json",
        paramsMap.get("repoBaseUrl") ?? window.location.href
    );
    return getFile(promptsDataUrl).then(function (response) {
        const rand = mulberry32(
            cyrb128(
                `${response.data[paramsMap.get("prompt")]}${paramsMap.get(
                    "seed"
                )}`
            )[0]
        );
        const promptParamsMap = new Map(
            Array.from(
                (paramsMap.get("promptParams") ?? new Map()).entries()
            ).map(function ([varName, paramSpec]) {
                return [
                    varName,
                    paramGenerators.get(paramSpec.generator)(
                        rand,
                        paramSpec.options ?? {}
                    ),
                ];
            })
        );
        return stringTemplateParser(
            response.data[paramsMap.get("prompt")],
            promptParamsMap
        );
    });
}
// TODO: add a function that generates parameters

export { getPrompt };
