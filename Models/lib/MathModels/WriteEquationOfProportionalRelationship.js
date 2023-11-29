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
        xvar,
        ylab,
        yvar,
        name,
        gender,
        recipe,
        fractionof,
    } = model.params;
    const shortPrompt = `Write an equation to describe the proportional relationship between the amount of ${xlab}, $${
        xvar ?? xlab?.[0] ?? "x"
    }$, and the amount of ${ylab}, $${yvar ?? ylab?.[0] ?? "y"}$.`;
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
    const { a, b, x, y, xlab, ylab, yvar } = model.params;
    return dom("div", { style: "display: block; margin: 15px;" }, [
        `$${yvar ?? ylab?.[0] ?? "y"} = $ `,
        new MathField.View(
            {
                ...model,
                input: model.input.get("eqn_rhs"),
            },
            function (message) {
                model.input.set(`eqn_rhs`, message.value);
                updateParent(message);
            }
        ).dom(),
    ]);
}

function check(model) {
    const { xvar, xlab, ylab, yvar, a, b } = model.params;
    const xval = Math.random();
    model.ce.pushScope();
    model.ce.declare("a", { domain: "RealNumbers", value: a });
    model.ce.declare("b", { domain: "RealNumbers", value: b });
    model.ce.declare(xvar ?? xlab?.[0] ?? "x", {
        domain: "RealNumbers",
        value: xval,
    });
    const rhs = model.ce.box(
        JSON.parse(model.input.get("eqn_rhs")?.json ?? "0")
    );
    const y = model.ce.parse(`a/b*${xvar ?? xlab?.[0] ?? "x"}`);
    return y.N().isEqual(rhs.N());
    model.ce.popScope();
    return model.checkerModule["evalsToZero"]("y-\\frac{a}{b}*x", {
        ...model.params,
        y: model.input.get("eqn_rhs"),
        x: `${xvar ?? xlab?.[0] ?? "x"}`,
    });
}

export { prompt, check, inputDom };
