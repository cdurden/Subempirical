import * as MathField from "../MathField.js";
import * as HtmlTapeDiagram from "../../HtmlTapeDiagram.js";
import { dom, zip, loadStylesheet } from "../../../lib/common.js";

function prompt(model, { abbreviate }) {
    const {
        a,
        b,
        x,
        y,
        xlab,
        ylab,
        name,
        gender,
        recipe,
        fractionof,
    } = model.params;
    const shortPrompt = fractionof
        ? `Express the amount of ${ylab} as a fraction of the amount of ${xlab}.`
        : `Describe the proportional relationship between the amount of ${ylab} and the amount of ${xlab}.`;
    if (abbreviate) {
        return shortPrompt;
    }
    return `${name ?? "Kobe"} has a recipe for ${recipe ?? "cake"} which uses ${
        x[0]
    } cups of ${xlab} and ${
        y[0]
    } cups of ${ylab}. To make different size cakes, ${
        gender !== "female" ? "he" : "she"
    } uses different amounts of the ingredients but he keeps their ratio the same. ${shortPrompt}`;
}

function inputDom(model, updateParent) {
    const { a, b, x, y, xlab, ylab } = model.params;
    return dom("div", { style: "display: flex;" }, []);
}

function check(model) {
    const { a, b, x, y } = model.params;
    const n = Math.max(x.length, y.length);
    var correct = true;
    for (let i = 0; i < n; i++) {
        correct =
            correct &&
            model.checkerModule["evalsToZero"]("a/b-y_i/x_i", {
                x_i: x[i] ?? model.input.get(`x_${i}`),
                y_i: y[i] ?? model.input.get(`y_${i}`),
                ...model.params,
            });
    }
    return correct;
}

export { prompt, check, inputDom };
