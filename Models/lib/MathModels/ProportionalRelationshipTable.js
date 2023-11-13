import * as MathField from "../MathField.js";
import * as HtmlTapeDiagram from "../../HtmlTapeDiagram.js";
import { dom, zip, loadStylesheet } from "../../../lib/common.js";

function prompt(model) {
    const { a, b, x, y } = model.params;
    return `Fill in the empty cells of the table to make equivalent ratios.`;
}

function inputDom(model, updateParent) {
    const { a, b, x, y, xlab, ylab } = model.params;
    const tapeDiagramContainer = dom("div", { style: "float: left;" }, []);
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
    return dom("div", { style: "display: flex;" }, [
        dom("div", { style: "float: left;" }, [
            dom("table", { class: "table-of-values" }, [
                dom("tr", {}, [dom("th", {}, xlab), dom("th", {}, ylab)]),
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
                                      }
                                  ).dom(),
                        ]),
                        dom("td", {}, [
                            yi
                                ? yi
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
                                      }
                                  ).dom(),
                        ]),
                    ]);
                }),
            ]),
        ]),
        dom("div", { style: "padding: 15px;" }, [tapeDiagramContainer]),
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
                ...model.params,
            });
    }
    return correct;
}

export { prompt, check, inputDom };
