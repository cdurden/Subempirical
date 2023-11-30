import * as MathField from "../MathField.js";
import * as HtmlTapeDiagram from "../../HtmlTapeDiagram.js";
import { dom, zip, loadStylesheet } from "../../../lib/common.js";

function prompt(model, { abbreviate }) {
    const { a, b, x, y, xlab, ylab, name, gender, recipe } = model.params;
    const shortPrompt = `Fill in the table to represent the proportional relationship between ${xlab} and ${ylab}.`;
    if (abbreviate) {
        return shortPrompt;
    }
    return `${name ?? "Kobe"} has a recipe for ${recipe ?? "cake"} which uses ${
        x?.[0]
    } cups of ${xlab} and ${
        y?.[0]
    } cups of ${ylab}. To make different size cakes, ${
        gender !== "female" ? "he" : "she"
    } uses different amounts of the ingredients but he keeps their ratio the same. ${shortPrompt}`;
}

function inputDom(model, updateParent) {
    const { a, b, x, y, xlab, ylab, xvar, yvar, showTape } = model.params;
    const tapeDiagramContainer = dom("div", { style: "float: left;" }, []);
    /*
    HtmlTapeDiagram.init(
        new Map([
            ...Array.from(model.paramsMap.entries()),
            ["xlab", xlab],
            ["ylab", ylab],
        ]),
        updateParent
    ).then(function (tapeDiagramMVU) {
        tapeDiagramContainer.append(tapeDiagramMVU.view.dom());
    });
    */
    return dom("div", { style: "display: flex;" }, [
        dom("div", { style: "float: left;" }, [
            dom("table", { class: "table-of-values" }, [
                dom("tr", {}, [
                    dom("th", {}, [xlab, dom("br", {}, []), `$${xvar}$`]),
                    dom("th", {}, [ylab, dom("br", {}, []), `$${yvar}$`]),
                ]),
                ...zip(x ?? [], y ?? []).map(function ([xi, yi], i) {
                    return dom("tr", {}, [
                        dom("td", {}, [
                            xi
                                ? xi
                                : new MathField.View(
                                      {
                                          ...model,
                                          input: model.input.get(`x_${i}`),
                                      },
                                      function (message) {
                                          model.input.set(
                                              `x_${i}`,
                                              message.value
                                          );
                                          updateParent(message);
                                      }
                                  ).dom(),
                        ]),
                        dom("td", {}, [
                            yi
                                ? `$${model.ce.parse(yi).latex}$`
                                : new MathField.View(
                                      {
                                          ...model,
                                          input: model.input.get(`y_${i}`),
                                      },
                                      function (message) {
                                          model.input.set(
                                              `y_${i}`,
                                              message.value
                                          );
                                          updateParent(message);
                                      }
                                  ).dom(),
                        ]),
                    ]);
                }),
            ]),
        ]),
        dom(
            "div",
            { style: "padding: 15px;" },
            showTape ? [tapeDiagramContainer] : []
        ),
    ]);
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
                a,
                b,
            });
    }
    return correct;
}

export { prompt, check, inputDom };
