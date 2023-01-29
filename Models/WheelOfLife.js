import { any, all, getFile, mapReplacer } from "../lib/common.js";
function drawCircle(group, r, fill = "none") {
    const drawing = group
        .circle(2 * r)
        .attr({ stroke: "black", "fill-opacity": 0, fill, cx: 0, cy: 0 });
    return drawing;
}
function drawDivider(group, r, theta = 0) {
    const dx = r * Math.cos(theta);
    const dy = -r * Math.sin(theta);
    const drawing = group.line(0, 0, dx, dy).attr({ stroke: "black" });
    return drawing;
}
function drawSector(group, r, theta0, theta1, n, fill) {
    const dtheta = (theta1 - theta0) / n;
    const x0 = r * Math.cos(theta0);
    const y0 = -r * Math.sin(theta0);
    const points = [
        [0, 0],
        [x0, y0],
    ];
    Array.from({ length: n }).forEach(function (_, i) {
        const x1 = r * Math.cos(theta0 + (i + 1) * dtheta);
        const y1 = -r * Math.sin(theta0 + (i + 1) * dtheta);
        points.push([x1, y1]);
        const dsector = group
            .polygon(points)
            .attr({ stroke: "black", "pointer-events": "none", fill });
    });
    return group;
}
function drawLabel(group, r, theta = 0, label) {
    const cx = r * Math.cos(theta);
    const cy = -r * Math.sin(theta);
    const drawing = group
        .text(label)
        .attr({ x: cx, y: cy, "text-anchor": "middle" });
    return drawing;
}

function View(update) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    function render(model) {
        return new Promise(function (resolve) {
            rootElement.replaceChildren();
            const viewContainerElmt = document.createElement("div");
            rootElement.appendChild(viewContainerElmt);
            const maxRating = model.data.maxRating;
            const nSectors = model.data.nSectors;
            const radius = 250;
            const width = (2 * radius * (nSectors + 2)) / nSectors;
            const height = width;
            const boundingRect = {
                x: -width / 2,
                y: -height / 2,
                height,
                width,
            };
            const draw = SVG()
                .addTo(rootElement)
                .size(width, height)
                .viewbox(boundingRect);
            const svg = draw.node;
            const pt = svg.createSVGPoint();

            // Draw dividing line segments
            Array.from({ length: nSectors }).forEach(function (_, sector) {
                drawDivider(draw, radius, (2 * Math.PI * sector) / nSectors);
            });
            // Draw sector labels
            Array.from({ length: nSectors }).forEach(function (_, sector) {
                drawLabel(
                    draw,
                    (radius * (nSectors + 1)) / nSectors,
                    (2 * Math.PI * (sector + 0.5)) / nSectors,
                    model.data.sectorLabels[sector]
                );
            });
            // Draw sectors
            Array.from({ length: nSectors }).forEach(function (_, sector) {
                const rating = model.data.ratings[sector];
                const sectorDrawing = drawSector(
                    draw,
                    (radius * rating) / maxRating,
                    (2 * Math.PI * sector) / nSectors,
                    (2 * Math.PI * (sector + 1)) / nSectors,
                    10,
                    "lightgrey"
                );
            });
            // Draw circles
            Array.from({ length: maxRating }).forEach(function (_, i) {
                const rating = maxRating - i;
                const circle = drawCircle(
                    draw,
                    (radius * rating) / maxRating,
                    "white"
                );
                document.addEventListener("click", function (event) {
                    if (event.target === circle.node) {
                        pt.x = event.clientX;
                        pt.y = event.clientY;

                        // The cursor point, translated into svg coordinates
                        const cursorpt = pt.matrixTransform(
                            svg.getScreenCTM().inverse()
                        );
                        const theta =
                            cursorpt.y < 0
                                ? Math.atan(
                                      cursorpt.x / cursorpt.y
                                      //(radius - event.x) / (radius - event.y)
                                  ) +
                                  Math.PI / 2
                                : Math.atan(
                                      cursorpt.x / cursorpt.y
                                      //(radius - event.x) / (radius - event.y)
                                  ) +
                                  (3 * Math.PI) / 2;
                        const sector = Math.floor(
                            (theta / (2 * Math.PI)) * nSectors
                        );
                        update({ action: "setRating", sector, rating }, self);
                    }
                });
            });
            resolve(self);
        });
    }
    return Object.assign(self, {
        rootElement,
        render,
    });
}
function makeUpdateFunction(model) {
    return function update(message, view) {
        if (message.action === "setRating") {
            model.data.ratings[message.sector] = message.rating;
        }
        if (view !== undefined) {
            view.render(model);
        }
        return true;
    };
}

function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const data = {
        nSectors: 8,
        maxRating: 10,
        sectorLabels: [
            "Finances",
            "Work",
            "Romance",
            "Family",
            "Community",
            "Fun",
            "Health",
            "Home",
        ],
        ratings: [0, 4, 5, 0, 0, 0, 0, 0],
    };
    function exportModel() {
        const blob = new Blob([JSON.stringify(data, mapReplacer)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.setAttribute("href", url);
        anchor.setAttribute("download", `model.json`);
        const clickHandler = function () {
            setTimeout(function () {
                URL.revokeObjectURL(url);
                anchor.removeEventListener("click", clickHandler);
            }, 150);
        };
        anchor.addEventListener("click", clickHandler, false);
        anchor.click();
    }
    return new Promise(function (resolve) {
        resolve(
            Object.assign(self, {
                data,
                exportModel,
            })
        );
        /*
        getFile(paramsMap.get("file")).then(function (response) {
            data.omtex = response.data;
            resolve(
                Object.assign(self, {
                    data,
                    exportModel,
                    update,
                })
            );
        });
        */
    });
}
function init(paramsMap) {
    return new Model(paramsMap).then(function (model) {
        const update = makeUpdateFunction(model);
        const view = new View(update);
        return { model, view, update };
    });
}

function main(paramsMap, onUpdate) {
    const container = document.getElementById("virginia-content");
    init(paramsMap).then(function (mvu) {
        container.appendChild(mvu.view.rootElement);
        mvu.view.render(mvu.model).then(function (view) {
            const exportModelLink = document.createElement("a");
            exportModelLink.textContent = "Export";
            exportModelLink.addEventListener("click", mvu.model.exportModel);
            container.appendChild(exportModelLink);
        });
    });
}
export { init, main, Model };
