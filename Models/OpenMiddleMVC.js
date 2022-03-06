import { any, all, getFile, mapReplacer } from "../common.js";
//const omtex = ("\\displaylines{\\frac{x^{\\omspace{0}}}{x^{\\omspace{1}}} < x^{\\left(\\frac{\\omspace{2}}{\\omspace{3}}\\right)} < \\frac{x^{\\omspace{4}}}{x^{\\omspace{5}}} \\\\ \\omtile{0} \\omtile{1} \\omtile{2} \\omtile{3} \\omtile{4} \\omtile{5} \\omtile{6} \\omtile{7} \\omtile{8} \\omtile{9}}");

function getSvgElmtCoordinates(svgElmt) {
    const baseVal = svgElmt.transform.baseVal;
    if (
        baseVal.length === 0 ||
        baseVal.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE
    ) {
        return [0, 0];
    } else {
        const transform = baseVal.getItem(0);
        return [transform.matrix.e, transform.matrix.f];
    }
}

// MathJax-related utility functions
function insertMath(tex, container) {
    const mathJaxElement = document.createElement("div");
    mathJaxElement.style["font-size"] = "48pt";
    mathJaxElement.innerHTML = `\\(${tex}\\)`;
    container.appendChild(mathJaxElement);
    return mathJaxElement;
}

// MathJax typesetting needs to be done after the elements
// containing math have been inserted into the DOM.
// See also https://www.peterkrautzberger.org/0165/
function typeset(code) {
    const mathJaxElements = code();
    return MathJax.typesetPromise(mathJaxElements)
        .then(function () {
            return mathJaxElements;
        })
        .catch(function (err) {
            console.log("Typeset failed: " + err.message);
        });
}

// Model-building utility functions
function generateSpace(content = null) {
    return {
        content,
    };
}
// Constants
function Controller(model, view) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Controller.prototype);
    function bind() {
        function dragMoveListener(event) {
            const tileIndex = event.target.getAttribute("data-tile-index");
            view.moveTile(tileIndex, event.dx, event.dy);
        }
        function dragEndListener(event) {
            if (!event.hasOwnProperty("dropzone")) {
                const tileIndex = event.target.getAttribute("data-tile-index");
                view.returnTile(tileIndex); // FIXME: This should not be necessary
                model.returnTile(tileIndex);
            }
        }
        //interact("svg .openMiddleTile").draggable({
        view.getTileSvgElmts().forEach(function (tileElmt) {
            interact(tileElmt).draggable({
                // enable inertial throwing
                inertia: true,
                // keep the element within the area of it's parent
                restrict: {
                    restriction: "parent",
                    endOnly: true,
                    elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
                },
                // enable autoScroll
                autoScroll: true,
                // call this function on every dragmove event
                onmove: dragMoveListener,
                // call this function on every dragend event
                onend: dragEndListener,
            });
        });
        //interact("svg .openMiddleSpace")
        view.getSpaceSvgElmts().forEach(function (spaceElmt) {
            interact(spaceElmt)
                .dropzone({
                    overlap: 0.01,
                    ondrop: function (event) {
                        const fromTileIndex = event.relatedTarget.getAttribute(
                            "data-tile-index"
                        );
                        const toSpaceIndex = event.target.getAttribute(
                            "data-space-index"
                        );
                        model.fillSpace(fromTileIndex, toSpaceIndex);
                    },
                })
                .on("dropactivate", function (event) {
                    event.target.classList.add("drop-activated");
                });
        });
    }
    return Object.assign(self, {
        bind,
    });
}
function View(model) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    var transform;
    var tiles;
    var spaces;
    function getTileSvgElmts() {
        return tiles.map(function (tile) {
            return tile.svgElmt;
        });
    }
    function getSpaceSvgElmts() {
        return spaces;
    }
    function returnTile(index) {
        tiles[index].x = tiles[index].y = 0;
        tiles[index].svgElmt.transform.baseVal.initialize(
            tiles[index].svgElmt.closest("svg").createSVGTransform()
        );
    }
    function updateTiles() {
        model.tiles.forEach(function (tile, tileIndex) {
            if (
                !any(
                    model.spaces.map(function (space) {
                        return space.content === tileIndex;
                    })
                )
            ) {
                returnTile(tileIndex);
            }
        });
    }
    function moveTile(index, dx, dy) {
        const dA = new DOMPoint((tiles[index].x += dx), (tiles[index].y += dy));
        //const dB = dA.matrixTransform(model.tiles[index].transform);
        const dB = dA.matrixTransform(transform);
        // translate the element
        tiles[index].svgElmt.transform.baseVal
            .getItem(0)
            .setTranslate(dB.x, dB.y);
    }
    function render() {
        return new Promise(function (resolve) {
            typeset(function () {
                return [insertMath(model.getModelData().omtex, rootElement)];
            }).then(function () {
                const feedback = document.createElement("div");
                rootElement.appendChild(feedback);
                spaces = Array.from(
                    rootElement.querySelectorAll("svg .openMiddleSpace")
                ).sort(function (a, b) {
                    return (
                        Number(a.getAttribute("data-space-index")) -
                        Number(b.getAttribute("data-space-index"))
                    );
                });
                tiles = Array.from(
                    rootElement.querySelectorAll("svg .openMiddleTile")
                ).map(function (svgElmt) {
                    return {
                        x: 0,
                        y: 0,
                        svgElmt,
                        origin: svgElmt.transform.baseVal.initialize(
                            svgElmt.closest("svg").createSVGTransform()
                        ),
                        transform: svgElmt.getScreenCTM().inverse(),
                    };
                });
                // Set the tile background to filled so that it can be dragged from any point in its interior
                tiles.forEach(function (tile, index) {
                    tile.svgElmt.setAttribute("data-tile-index", index);
                    const rect = tile.svgElmt.querySelector("rect");
                    if (rect === null) return;
                    rect.style.fill = "white";
                    tile.svgElmt.insertBefore(rect, tile.svgElmt.firstChild); // Place the background rect at the beginning of the tile's group element so that the foreground text is visible.
                });
                const tile = tiles[0];
                transform = tile.svgElmt.getScreenCTM().inverse();
                transform.e = transform.f = 0;
                model.finalize(self);
                resolve(self);
            });
        });
    }
    return Object.assign(self, {
        rootElement,
        render,
        returnTile,
        moveTile,
        updateTiles,
        getTileSvgElmts,
        getSpaceSvgElmts,
    });
}

function Model(paramMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const updateHandlers = [];
    const model = {};
    function finalize(view) {
        const spaces = Array.from(
            view.rootElement.querySelectorAll("svg .openMiddleSpace")
        ).map(function (spaceId, index) {
            return generateSpace();
        });
        const tiles = Array.from(
            view.rootElement.querySelectorAll("svg .openMiddleTile")
        ).map(function (svgElmt) {
            return {
                value: svgElmt.getAttribute("data-value"),
            };
        });
        model.spaces = spaces;
        model.tiles = tiles;
    }
    function emptySpace(spaceIndex) {
        model.spaces[spaceIndex].content = null;
        updateHandlers.forEach(function (updateHandler) {
            updateHandler(model);
        });
    }
    function fillSpace(tileIndex, spaceIndex) {
        model.spaces[spaceIndex].content = Number(tileIndex);
        updateHandlers.forEach(function (updateHandler) {
            updateHandler(model);
        });
    }
    function returnTile(tileIndex) {
        model.spaces.forEach(function (space, index) {
            if (space.content === tileIndex) {
                space.content = null;
            }
        });
        updateHandlers.forEach(function (updateHandler) {
            updateHandler(model);
        });
    }
    function areSpacesFilled() {
        return all(
            model.spaces.map(function (space) {
                return space.content !== null;
            })
        );
    }
    function getModelData() {
        return model;
    }
    function exportModel() {
        const blob = new Blob([JSON.stringify(getModelData(), mapReplacer)], {
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
    function addUpdateHandler(updateHandler) {
        updateHandlers.push(updateHandler);
    }
    return new Promise(function (resolve) {
        getFile(paramMap.get("file")).then(function (response) {
            model.omtex = response.data;
            resolve(
                Object.assign(self, {
                    getModelData,
                    exportModel,
                    fillSpace,
                    emptySpace,
                    returnTile,
                    areSpacesFilled,
                    addUpdateHandler,
                    finalize,
                })
            );
        });
    });
}
function init(paramMap, onUpdate) {
    return new Model(paramMap).then(function (model) {
        const view = new View(model);
        const controller = new Controller(model, view);
        return { model, view, controller };
    });
}

function main(paramMap, onUpdate) {
    const container = document.getElementById("virginia-content");
    init(paramMap, onUpdate).then(function (mvc) {
        container.appendChild(mvc.view.rootElement);
        mvc.view.render().then(function (view) {
            mvc.controller.bind();
            mvc.model.addUpdateHandler(view.updateTiles);
            const exportModelLink = document.createElement("a");
            exportModelLink.textContent = "Export";
            exportModelLink.addEventListener("click", mvc.model.exportModel);
            container.appendChild(exportModelLink);
        });
    });
}
export { init, main, Model };
