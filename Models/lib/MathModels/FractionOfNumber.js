import * as MathField from "../MathField.js";

function prompt(model) {
    const { a, b, m, n } = model.params;
    return `Find \$ \\frac{${a}}{${b}} \$ of \$ ${n} \$`;
}

function inputDom(model, update) {
    return new MathField.View(model, function (message) {
        model.input.set("x", message.value);
    }).dom();
}

function check(model) {
    return model.checkerModule["evalsToZero"]("x-a/b*n", {
        ...Object.fromEntries(model.input),
        ...model.params,
    });
}

export { prompt, check, inputDom };
