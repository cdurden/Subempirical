import { any, all, getFile, mapReplacer, loadScript } from "../lib/common.js";
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

function Modal(update, container) {
    const self = Object.create(null);
    var modalBackdropElmt = document.createElement("div");
    Object.setPrototypeOf(self, View.prototype);
    function render(model) {
        function show() {
            modalBackdropElmt.style.display = "block";
        }
        function hide() {
            modalBackdropElmt.style.display = "none";
            document.removeEventListener("keydown", keyboardHandler);
        }
        const keyboardHandler = function (event) {
            if (event.key === "Escape") {
                hide();
            } else if (event.key === "Enter") {
                model.onSubmit(model);
                hide();
            }
        };
        return new Promise(function (resolve) {
            modalBackdropElmt.replaceWith();
            modalBackdropElmt = document.createElement("div");
            container.appendChild(modalBackdropElmt);
            modalBackdropElmt.classList.add("modal-backdrop");
            const modalElmt = document.createElement("div");
            modalElmt.replaceWith();
            modalElmt.classList.add("modal");
            modalBackdropElmt.appendChild(modalElmt);
            const modalHeaderElmt = document.createElement("div");
            modalHeaderElmt.classList.add("modal-header");
            modalHeaderElmt.textContent = model.header;
            modalElmt.appendChild(modalHeaderElmt);
            const modalBodyElmt = document.createElement("div");
            modalBodyElmt.classList.add("modal-body");
            modalBodyElmt.innerHTML = model.body;
            modalElmt.appendChild(modalBodyElmt);
            const focusable = modalBodyElmt.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length > 0) {
                focusable[0].focus();
                focusable[0].select();
            }
            const modalOkButtonElmt = document.createElement("button");
            modalOkButtonElmt.textContent = "OK";
            modalBodyElmt.appendChild(modalOkButtonElmt);
            const modalCancelButtonElmt = document.createElement("button");
            modalCancelButtonElmt.textContent = "Cancel";
            modalBodyElmt.appendChild(modalCancelButtonElmt);
            modalOkButtonElmt.addEventListener("click", function () {
                model.onSubmit(model);
            });
            modalCancelButtonElmt.addEventListener("click", function () {
                hide();
            });
            document.addEventListener("keydown", keyboardHandler);
        });
    }
    return Object.assign(self, {
        render,
    });
}

function View(update, container) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    function render(model) {
        return new Promise(function (resolve) {
            container.replaceChildren();
            const modal = new Modal(function (model) {
                update(model, self);
            }, container);
            const viewContainerElmt = document.createElement("div");
            container.appendChild(viewContainerElmt);
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
                .addTo(container)
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
                const labelSvgElmt = drawLabel(
                    draw,
                    (radius * (nSectors + 1)) / nSectors,
                    (2 * Math.PI * (sector + 0.5)) / nSectors,
                    model.data.sectorLabels[sector]
                );
                labelSvgElmt.node.addEventListener("click", function (event) {
                    modal.render({
                        header: "Set label",
                        sector,
                        body: `<input type='text' id='sectorLabelInput', value=${model.data.sectorLabels[sector]}>`,
                        onSubmit: function () {
                            const label = document.getElementById(
                                "sectorLabelInput"
                            ).value;
                            update(
                                {
                                    action: "setSectorLabel",
                                    sector,
                                    label,
                                },
                                self
                            );
                        },
                    });
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
            // Controls
            const nSectorsIndicatorElmt = document.createElement("button");
            nSectorsIndicatorElmt.textContent = `${nSectors} sectors`;
            viewContainerElmt.appendChild(nSectorsIndicatorElmt);
            nSectorsIndicatorElmt.addEventListener("click", function (event) {
                modal.render({
                    header: "Set number of sectors",
                    nSectors,
                    body: `<input type='text' id='nSectorsInput', value=${model.data.nSectors}>`,
                    onSubmit: function () {
                        const nSectors = Number(
                            document.getElementById("nSectorsInput").value
                        );
                        update(
                            {
                                action: "setNumberOfSectors",
                                nSectors,
                            },
                            self
                        );
                    },
                });
            });
            const maxRatingIndicatorElmt = document.createElement("button");
            maxRatingIndicatorElmt.textContent = `Max rating: ${maxRating}`;
            viewContainerElmt.appendChild(maxRatingIndicatorElmt);
            maxRatingIndicatorElmt.addEventListener("click", function (event) {
                modal.render({
                    header: "Set number of sectors",
                    maxRating,
                    body: `<input type='text' id='maxRatingInput', value=${model.data.maxRating}>`,
                    onSubmit: function () {
                        const maxRating = Number(
                            document.getElementById("maxRatingInput").value
                        );
                        update(
                            {
                                action: "setMaxRating",
                                maxRating,
                            },
                            self
                        );
                    },
                });
            });
            resolve(self);
        });
    }
    return Object.assign(self, {
        container,
        render,
    });
}
function makeUpdateFunction(model, callbacks) {
    return function update(message, view) {
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
        } else if (message.action === "setMaxRating") {
            const maxRating = message.maxRating;
            model.data.ratings = model.data.ratings.map(function (rating) {
                if (rating > maxRating) {
                    return maxRating;
                } else {
                    return rating;
                }
            });
            model.data.maxRating = maxRating;
        } else if (message.action === "setRating") {
            model.data.ratings[message.sector] = message.rating;
        } else if (message.action === "setSectorLabel") {
            model.data.sectorLabels[message.sector] = message.label;
        }
        if (view !== undefined) {
            view.render(model);
        }
        callbacks.forEach(function (callback) {
            callback(model);
        });
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
        /*
        resolve(
            Object.assign(self, {
                data,
                exportModel,
            })
        );
        */
        getFile(paramsMap.get("file")).then(function (response) {
            resolve(
                Object.assign(self, {
                    data: response.data,
                    exportModel,
                })
            );
        });
    });
}
function init(paramsMap, onUpdateCallbacks) {
    const scriptSourceMap = new Map([
        ["localhost", ["/node_modules/@svgdotjs/svg.js/dist/svg.js"]],
        ["other", ["https://unpkg.com/@svgdotjs/svg.js"]],
    ]);
    const hostname = window.location.hostname;
    const scriptSource = scriptSourceMap.has(hostname) ? hostname : "other";
    return Promise.all(
        scriptSourceMap.get(scriptSource).map(function (script) {
            return loadScript(script);
        })
    ).then(function () {
        return new Model(paramsMap).then(function (model) {
            const update = makeUpdateFunction(model, onUpdateCallbacks);
            const rootElement = document.createElement("div");
            const view = new View(update, rootElement);
            return { model, view, update };
        });
    });
}

function main(paramsMap, onUpdateCallbacks) {
    const container = document.getElementById("virginia-content");
    init(paramsMap, onUpdateCallbacks).then(function (mvu) {
        container.appendChild(mvu.view.container);
        mvu.view.render(mvu.model).then(function (view) {
            const exportModelLink = document.createElement("a");
            exportModelLink.textContent = "Export";
            exportModelLink.addEventListener("click", mvu.model.exportModel);
            container.appendChild(exportModelLink);
        });
    });
}
export { init, main, Model };
