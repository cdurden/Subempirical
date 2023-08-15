import {
    any,
    all,
    dom,
    getFile,
    mapReplacer,
    loadScript,
    composeUpdateThenRender,
} from "../lib/common.js";

import { init as initModal } from "./Modal.js";

function drawCircle(group, r, fill = "none") {
    const drawing = group.circle(2 * r).attr({
        stroke: "black",
        "fill-opacity": 0,
        fill,
        cx: 0,
        cy: 0,
        cursor: "pointer",
    });
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

function View(model, update) {
    const self = Object.create(null);
    const rootElement = document.createElement("div");
    Object.setPrototypeOf(self, View.prototype);
    function render() {
        return new Promise(function (resolve) {
            rootElement.replaceChildren();
            //const modal = new ModalView();
            //rootElement.appendChild(modal.rootElement);
            rootElement.appendChild(self.modalView.rootElement);
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
            svg.style.height = "100%";
            const pt = svg.createSVGPoint();

            // Draw dividing line segments
            Array.from({ length: nSectors }).forEach(function (_, sector) {
                drawDivider(draw, radius, (2 * Math.PI * sector) / nSectors);
            });
            // Draw sector labels
            Array.from({ length: nSectors }).forEach(function (_, sector) {
                const labelSvgElmt = drawLabel(
                    draw,
                    (radius * (nSectors + 1)) / nSectors,
                    (2 * Math.PI * (sector + 0.5)) / nSectors,
                    model.data.sectorLabels[sector]
                );
                labelSvgElmt.node.addEventListener("click", function (event) {
                    update({ action: "editSectorLabel", sector });
                    //modal.render(update);
                });
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
                                ? Math.atan(cursorpt.x / cursorpt.y) +
                                  Math.PI / 2
                                : Math.atan(cursorpt.x / cursorpt.y) +
                                  (3 * Math.PI) / 2;
                        const sector = Math.floor(
                            (theta / (2 * Math.PI)) * nSectors
                        );
                        update({ action: "setRating", sector, rating }, model);
                    }
                });
            });
            // Controls
            const menuElmt = document.createElement("ul");
            menuElmt.className = "pure-menu-list pure-menu-horizontal";
            menuElmt.style.position = "fixed";
            const settingsListElmt = document.createElement("li");
            settingsListElmt.className =
                "pure-menu-item pure-menu-has-children pure-menu-allow-hover";
            const settingsButtonElmt = document.createElement("button");
            settingsButtonElmt.textContent = "Settings";
            settingsButtonElmt.className = "pure-menu-link";
            const settingsMenuElmt = document.createElement("ul");
            settingsMenuElmt.className = "pure-menu-children";
            const nSectorsMenuItemElmt = document.createElement("li");
            const maxRatingMenuItemElmt = document.createElement("li");
            nSectorsMenuItemElmt.className = "pure-menu-item";
            maxRatingMenuItemElmt.className = "pure-menu-item";
            settingsMenuElmt.appendChild(nSectorsMenuItemElmt);
            settingsMenuElmt.appendChild(maxRatingMenuItemElmt);
            const nSectorsIndicatorElmt = document.createElement("button");
            nSectorsIndicatorElmt.textContent = `${nSectors} sectors`;
            nSectorsIndicatorElmt.className = "pure-menu-link";
            viewContainerElmt.appendChild(nSectorsIndicatorElmt);
            nSectorsIndicatorElmt.addEventListener("click", function (event) {
                update({ action: "editNumberOfSectors" });
            });
            const maxRatingIndicatorElmt = document.createElement("button");
            maxRatingIndicatorElmt.textContent = `Max rating: ${maxRating}`;
            maxRatingIndicatorElmt.className = "pure-menu-link";
            //viewContainerElmt.appendChild(maxRatingIndicatorElmt);
            maxRatingIndicatorElmt.addEventListener("click", function (event) {
                update({ action: "editMaxRating" });
            });
            settingsListElmt.appendChild(settingsButtonElmt);
            settingsListElmt.appendChild(settingsMenuElmt);
            maxRatingMenuItemElmt.appendChild(maxRatingIndicatorElmt);
            nSectorsMenuItemElmt.appendChild(nSectorsIndicatorElmt);
            settingsMenuElmt.appendChild(maxRatingMenuItemElmt);
            settingsMenuElmt.appendChild(nSectorsMenuItemElmt);
            viewContainerElmt.appendChild(menuElmt);
            const submitButtonElmt = dom("button", "Submit");
            submitButtonElmt.addEventListener("click", function (e) {
                update({ action: "submit", data: model.data });
            });
            menuElmt.append(submitButtonElmt);
            menuElmt.appendChild(settingsListElmt);
            resolve(self);
        });
    }
    return Object.assign(self, {
        rootElement,
        render,
        modalView: undefined,
    });
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
        ratings: [0, 0, 0, 0, 0, 0, 0, 0],
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
        getFile(paramsMap.get("file"), {
            baseURL: paramsMap.get("baseURL"),
        }).then(function (response) {
            resolve(
                Object.assign(self, {
                    data: JSON.parse(response.data),
                    exportModel,
                })
            );
        });
    });
}

function init(paramsMap, updateParent) {
    const scriptSourceMap = new Map([
        ["localhost", ["/node_modules/@svgdotjs/svg.js/dist/svg.js"]],
        ["other", ["https://unpkg.com/@svgdotjs/svg.js@3.2.0/dist/svg.js"]],
    ]);
    const hostname = window.location.hostname;
    const scriptSource = scriptSourceMap.has(hostname) ? hostname : "other";
    return Promise.all(
        scriptSourceMap.get(scriptSource).map(function (script) {
            return loadScript(script);
        })
    ).then(function () {
        return new Model(paramsMap).then(function (model) {
            const view = new View(model, update);
            var modalUpdate;
            function update(message) {
                if (message.action === "setNumberOfSectors") {
                    const sectorLabels = [
                        ...model.data.sectorLabels.slice(
                            0,
                            Math.min(model.data.nSectors, message.nSectors)
                        ),
                        ...Array.from({
                            length: message.nSectors - model.data.nSectors,
                        }).fill("Unnamed"),
                    ];
                    model.data.nSectors = message.nSectors;
                    model.data.sectorLabels = sectorLabels;
                    view.render();
                } else if (message.action === "editNumberOfSectors") {
                    modalUpdate({
                        action: "updateModal",
                        modalSpec: {
                            header: "Set number of sectors",
                            //nSectors,
                            body: `<input type='text' id='nSectorsInput', value=${model.data.nSectors}>`,
                            onSubmit: function () {
                                const nSectors = Number(
                                    document.getElementById("nSectorsInput")
                                        .value
                                );
                                update(
                                    {
                                        action: "setNumberOfSectors",
                                        nSectors,
                                    },
                                    model
                                );
                            },
                        },
                    });
                    modalUpdate({ action: "show" });
                    //view.render();
                } else if (message.action === "setMaxRating") {
                    const maxRating = message.maxRating;
                    model.data.ratings = model.data.ratings.map(function (
                        rating
                    ) {
                        if (rating > maxRating) {
                            return maxRating;
                        } else {
                            return rating;
                        }
                    });
                    model.data.maxRating = maxRating;
                    view.render();
                } else if (message.action === "editMaxRating") {
                    modalUpdate({
                        action: "updateModal",
                        modalSpec: {
                            header: "Set maximum rating",
                            //maxRating,
                            body: `<input type='text' id='maxRatingInput', value=${model.data.maxRating}>`,
                            onSubmit: function () {
                                const maxRating = Number(
                                    document.getElementById("maxRatingInput")
                                        .value
                                );
                                update(
                                    {
                                        action: "setMaxRating",
                                        maxRating,
                                    },
                                    model
                                );
                            },
                        },
                    });
                    modalUpdate({ action: "show" });
                    //view.render();
                } else if (message.action === "setRating") {
                    model.data.ratings[message.sector] = message.rating;
                    view.render();
                } else if (message.action === "setSectorLabel") {
                    model.data.sectorLabels[message.sector] = message.label;
                    view.render();
                } else if (message.action === "editSectorLabel") {
                    modalUpdate({
                        action: "updateModal",
                        modalSpec: {
                            header: "Set label",
                            //sector,
                            body: `<input type='text' id='sectorLabelInput', value=${
                                model.data.sectorLabels[message.sector]
                            }>`,
                            onSubmit: function () {
                                const label = document.getElementById(
                                    "sectorLabelInput"
                                ).value;
                                update(
                                    {
                                        action: "setSectorLabel",
                                        sector: message.sector,
                                        label,
                                    },
                                    model
                                );
                            },
                        },
                    });
                    modalUpdate({ action: "show" });
                    //view.render();
                } else if (message.action === "setModal") {
                    view.modalView = message.modalView;
                    modalUpdate = message.modalUpdate;
                } else if (message.action === "loadSubmissions") {
                    model.data = JSON.parse(
                        message.submissions.pop().modelJsonData
                    );
                    view.render();
                }
                updateParent(message);
                return Promise.resolve(message);
            }
            updateParent({ action: "getSubmissions", update });
            return initModal(new Map(), update).then(function (modalMVU) {
                update({
                    action: "setModal",
                    modalUpdate: modalMVU.update,
                    modalView: modalMVU.view,
                });
                return {
                    model,
                    view,
                    update,
                };
            });
        });
    });
}

export { init };
