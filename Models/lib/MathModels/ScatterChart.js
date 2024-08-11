import { dom, loadResource } from "../../../lib/common.js";
import * as Base from "./Base.js";

function Model(paramsMap) {
    const rand = paramsMap.get("rand");
    const model = new Object();
    model.data = {
        datasets: [
            {
                label: "Table data",
                data: [],
                backgroundColor: "rgb(255, 99, 132)",
            },
            {
                label: "Graph of equation",
                showLine: true,
                data: [],
                backgroundColor: "rgb(99, 132, 255)",
            },
        ],
    };
    function setData({ tableData, eqnData }) {
        Object.assign(model.data.datasets[0].data, tableData);
        Object.assign(model.data.datasets[1].data, eqnData);
    }
    function check(model) {
        return (
            WriteEquationOfProportionalRelationship.check(model) &&
            ProportionalRelationshipTable.check(model)
        );
    }
    function updatePrompt() {
        model.setParams(
            ProportionalRelationshipPrompt.randPrompt(rand, model.params)
        );
    }
    return Object.assign(model, { check, prompt, updatePrompt, setData });
}

function View(model, update) {
    const view = Base.View(model, update);
    const canvas = dom("canvas", {}, []);
    const chart = new Chart(canvas, {
        type: "scatter",
        data: model.data,
        options: {
            scales: {
                x: {
                    type: "linear",
                    position: "bottom",
                    min: 0,
                    max: model.maxX,
                },
                y: {
                    type: "linear",
                    position: "bottom",
                    min: 0,
                    max: model.maxY,
                },
            },
        },
    });
    function clickHandler(event) {
        let scaleRef, valueX, valueY;

        for (var scaleKey in chart.scales) {
            scaleRef = chart.scales[scaleKey];
            if (scaleRef.isHorizontal() && scaleKey == "x") {
                valueX = scaleRef.getValueForPixel(event.offsetX);
            } else if (scaleKey == "y") {
                valueY = scaleRef.getValueForPixel(event.offsetY);
            }
        }

        if (
            valueX > chart.scales["x"].min &&
            valueX < chart.scales["x"].max &&
            valueY > chart.scales["y"].min &&
            valueY < chart.scales["y"].max
        ) {
            chart.data.datasets.forEach((dataset) => {
                dataset.data.push({
                    x: valueX,
                    y: valueY,
                    extraInfo: "info",
                });
            });
            chart.update();
        }
    }
    canvas.addEventListener("click", clickHandler);
    function myDom() {
        chart.update();
        return canvas;
    }
    function updateChart() {
        chart.canvas.parentNode.style.width = "100vh";
        chart.update();
    }
    return Object.assign(view, { dom: myDom, updateChart });
}

function init(paramsMap, updateParent) {
    return loadResource("ChartJS").then(function (chartJsModule) {
        const model = new Model(paramsMap);
        const view = new View(model, update);
        view.render();
        function update(message) {
            if (message.action === "setData") {
                model.setData(message.data);
                view.updateChart();
            }
        }
        return { model, view, update };
    });
}

export { init };
