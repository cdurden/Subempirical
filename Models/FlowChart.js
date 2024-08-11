import { any, all, mapReplacer, loadResource } from "../lib/common.js";

import { init as initAlgebraTile } from "./AlgebraTileSvg.js";
const doClone = false;
const displace = true;
const minStack = 0;

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

function SpaceView(svgElmt) {
    const spaceId = svgElmt.getAttribute("data-space-id");
    const contents = [];
    const spaceView = {
        spaceId,
        svgElmt: svgElmt,
        contents,
        insertTileView,
        removeTileView,
    };
    function insertTileView(tileView) {
        tileView.assignedSpaceId = spaceId;
        contents.push(tileView);
        spaceView.svgElmt.appendChild(tileView.svgElmt);
        tileView.svgElmt.transform.baseVal
            .getItem(0)
            .setTranslate(
                (spaceView.svgElmt.getBBox().width -
                    tileView.svgElmt.getBBox().width) /
                    2,
                0
            );
    }
    function removeTileView(tileView) {
        contents.splice(contents.indexOf(tileView), 1);
    }
    return spaceView;
}
function makeTileViewDraggable(view, tileView, update) {
    var dropzone;
    function dragMoveListener(event) {
        tileView.move(tileView.x + event.dx, tileView.y + event.dy);
        // Another approach would be to register this listener in the view itself.
    }
    function dragEndListener(event) {
        if (!event.hasOwnProperty("dropzone")) {
            if (tileView.assignedSpaceId !== undefined) {
                update(
                    {
                        action: "remove",
                        spaceId: tileView.assignedSpaceId,
                        tileId: tileView.tileId,
                    },
                    view
                );
            }
        } else {
            // Remove a tile view from previously-assigned space id
            if (tileView.assignedSpaceId !== undefined) {
                update(
                    {
                        action: "remove",
                        spaceId: tileView.assignedSpaceId,
                        tileId: tileView.tileId,
                    },
                    view
                );
            }
            const toSpaceId = event.dropzone.target.getAttribute(
                "data-space-id"
            );
            const success = update(
                {
                    action: "add",
                    spaceId: toSpaceId,
                    tileId: tileView.tileId,
                },
                view
            );
        }
    }
    const draggable = interact(tileView.svgElmt).draggable({
        // enable inertial throwing
        manualStart: doClone && !tileView.isClone, // FIXME: Enable control of cloning via params
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
    if (doClone && !tileView.isClone) {
        // FIXME: Enable control of cloning via params
        draggable.on("move", function (event) {
            const interaction = event.interaction;
            tileViewClone = tileView.clone();
            makeTileViewDraggable(view, tileViewClone, update);
        });
    }
}
function TileView(svgElmt, update, source = null) {
    const self = Object.create(null);
    Object.assign(self, {
        assignedSpaceId: undefined,
        isClone: false,
        ...source,
    });
    Object.setPrototypeOf(self, TileView.prototype);
    const tileId = svgElmt.getAttribute("data-tile-id");
    const transform = svgElmt.getScreenCTM().inverse();
    //svgElmt.setAttribute("data-tile-index", index);
    transform.e = transform.f = 0;
    Object.assign(self, {
        x: 0,
        y: 0,
        tileId,
        svgElmt,
        originalParent: svgElmt.parentElement,
        origin: svgElmt.transform.baseVal.initialize(
            svgElmt.closest("svg").createSVGTransform()
        ),
        transform,
        move,
        clone,
        reset,
        remove,
        hide,
        show,
    });
    function hide() {
        self.svgElmt.style.display = "none";
    }
    function show() {
        self.svgElmt.style.display = "block";
    }
    function remove() {
        self.svgElmt.remove();
    }
    function clone(parentElement = self.svgElmt.parentElement) {
        const clone = TileView(
            parentElement.appendChild(self.svgElmt.cloneNode(true)),
            update,
            self
        );
        clone.isClone = true;
        return clone;
    }
    function move(x, y) {
        self.x = x;
        self.y = y;
        const dA = new DOMPoint(x, y);
        const dB = dA.matrixTransform(transform);
        // translate the element
        self.svgElmt.transform.baseVal.getItem(0).setTranslate(dB.x, dB.y);
    }
    function reset() {
        if (self.isClone) {
            self.svgElmt.remove();
        } else {
            self.originalParent.appendChild(self.svgElmt);
            self.x = self.y = 0;
            self.svgElmt.transform.baseVal.initialize(
                self.svgElmt.closest("svg").createSVGTransform()
            );
        }
    }
    (function fillBackground() {
        const rect = svgElmt.querySelector("rect");
        if (rect === null) return;
        rect.style.fill = "white";
        svgElmt.insertBefore(rect, self.svgElmt.firstChild); // Place the background rect at the beginning of the tile's group element so that the foreground text is visible.
    })();
    return self;
}

function View(model, update) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    const tileViewMap = new Map();
    const spaceViewMap = new Map();
    const scale = 50;
    const width = 10;
    const height = 5;
    const boundingRect = {
        x: 0,
        y: 0,
        height: height * scale,
        width: width * scale,
    };
    const draw = SVG()
        .addTo(rootElement)
        .size(width * scale, height * scale)
        .viewbox(boundingRect);
    function addSpaceView(spaceView) {
        if (spaceViewMap.has(spaceView.spaceId)) {
            spaceViewMap.get(spaceView.spaceId).push(spaceView);
        } else {
            spaceViewMap.set(spaceView.spaceId, [spaceView]);
        }
    }
    function addTileView(tileView) {
        tileViewMap.set(tileView.tileId, tileView);
        tileView.render().then(function () {
            makeTileViewDraggable(self, tileView, update);
        });
    }
    function getSpaceViews(spaceId) {
        return spaceViewMap.get(spaceId) || [];
    }
    const feedback = document.createElement("div");
    function render() {
        return new Promise(function (resolve) {
            rootElement.appendChild(feedback);
            Array.from(rootElement.querySelectorAll("svg .dropzone"))
                .sort(function (a, b) {
                    return (
                        Number(a.getAttribute("data-space-id")) -
                        Number(b.getAttribute("data-space-id"))
                    );
                })
                .map(function (spaceViewSvgElmt) {
                    const spaceView = new SpaceView(spaceViewSvgElmt);
                    addSpaceView(spaceView);
                    update(
                        {
                            action: "createSpace",
                            spaceId: spaceView.spaceId,
                        },
                        self
                    );
                });
            Array.from(rootElement.querySelectorAll("svg .draggable")).map(
                function (tileViewSvgElmt, index) {
                    const tileValue = tileViewSvgElmt.getAttribute(
                        "data-value"
                    );
                    tileViewSvgElmt.setAttribute("data-tile-id", index);
                    const tileView = new TileView(tileViewSvgElmt, update);
                    addTileView(tileView);
                    update(
                        {
                            action: "createTile",
                            tileId: tileView.tileId,
                            tileValue: tileValue,
                        },
                        self
                    );
                    makeTileViewDraggable(self, tileView, update);
                }
            );
            Array.from(spaceViewMap.values()).map(function (spaceViews) {
                spaceViews.map(function (spaceView) {
                    interact(spaceView.svgElmt)
                        .dropzone({
                            overlap: 0.01,
                        })
                        .on("dropactivate", function (event) {
                            event.target.classList.add("drop-activated");
                        });
                });
            });
            resolve(self);
        });
    }
    const placedTileViewsMap = new Map();
    function placeTiles(model) {
        // Generate a mapping from tile ids to tile views that are free to be placed in space views.
        // Populate spaces with tiles from freeTileViewMap
        clearTiles(model);
        Array.from(model.data.spaceMap.values()).forEach(function (space) {
            space.contents.forEach(function (tile) {
                placedTileViewsMap.set(tile.id, []);
                const spaceViews = spaceViewMap.get(space.id) ?? [];
                const tileView = tileViewMap.get(tile.id);
                spaceViews.forEach(function (spaceView, index) {
                    const tileViewClone = tileView.clone();
                    tileViewClone.show();
                    tileView.reset();
                    makeTileViewDraggable(self, tileViewClone, update);
                    spaceView.insertTileView(tileViewClone);
                    placedTileViewsMap.get(tile.id).push(tileViewClone);
                });
            });
        });
        tileViewMap.forEach(function (tileView, tileId) {
            if (placedTileViewsMap.get(tileId)?.length > 0) {
                tileView.hide();
            } else {
                tileView.show();
            }
        });
    }
    function clearTiles() {
        placedTileViewsMap.forEach(function (placedTileViews) {
            placedTileViews.forEach(function (placedTileView) {
                placedTileView.remove();
            });
        });
        placedTileViewsMap.clear();
    }
    return Object.assign(self, {
        draw,
        rootElement,
        render,
        placeTiles,
        getSpaceViews,
        addTileView,
    });
}

function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const updateHandlers = [];
    const data = { tileMap: new Map(), spaceMap: new Map() };
    function addTileToSpace(spaceId, tile) {
        data.spaceMap.get(spaceId).contents.push(tile);
    }
    function removeTileFromSpace(spaceId, tile) {
        const space = data.spaceMap.get(spaceId);
        if (space.contents.includes(tile)) {
            space.contents.splice(space.contents.indexOf(tile), 1);
        }
    }
    function createTile(id, value) {
        const tile = {
            value,
            reset,
            id,
        };
        function reset() {
            Array.from(data.spaceMap.values()).forEach(function (space, index) {
                if (space.contents.includes(tile)) {
                    space.contents.splice(space.contents.indexOf(tile), 1);
                }
            });
            const modelUpdate = {
                spaces: new Map(
                    Array.from(model.spaceMap.entries()).filter(function ([
                        spaceId,
                        space,
                    ]) {
                        return space.contents.includes(tile);
                    })
                ),
            };
            updateHandlers.forEach(function (updateHandler) {
                updateHandler(modelUpdate);
            });
        }
        data.tileMap.set(tile.id, tile);
        return tile;
    }
    function createSpace(spaceId, contents = []) {
        const space = {
            id: spaceId,
            contents,
            isFull,
            addTile,
            removeTile,
        };
        const modelUpdate = {
            spaces: new Map([[space.id, space]]),
        };
        function isFull() {
            return space.contents.length > 0;
        }
        function addTile(tile) {
            if (isFull() && displace) {
                contents.splice(0, 1);
            }
            if (!isFull()) {
                contents.push(tile);
            }
        }
        function removeTile(tile) {
            space.contents.splice(space.contents.indexOf(tile), 1);
        }
        data.spaceMap.set(space.id, space);
        return space;
    }
    function getSpace(spaceId) {
        return data.spaceMap.get(spaceId);
    }
    function getTile(tileId) {
        return data.tileMap.get(tileId);
    }
    function findSpaceContaining(content) {
        return Array.from(model.spaces.values()).filter(function (space) {
            return space.contents.includes(content);
        })[0];
    }
    function areSpacesFull() {
        return all(
            model.spaces.map(function (space) {
                return space.isFull();
            })
        );
    }
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
    function addUpdateHandler(updateHandler) {
        updateHandlers.push(updateHandler);
    }
    return new Promise(function (resolve) {
        resolve(
            Object.assign(self, {
                data,
                exportModel,
                areSpacesFull,
                //addUpdateHandler,
                createSpace,
                createTile,
                getSpace,
                getTile,
                findSpaceContaining,
            })
        );
    });
}

function init(paramsMap, updateParentServices) {
    const rand = paramsMap.get("rand");
    const updateParent = updateParentServices.get("parent");
    return Promise.all([
        loadResource("SVGdotJS", {}, false),
        loadResource("InteractJS"),
    ]).then(function ([svgDotJsModule, interactJsModule]) {
        return Promise.resolve(new Model(paramsMap)).then(function (model) {
            const view = new View(model, update);
            initAlgebraTile(
                new Map([
                    ["svgRoot", view.draw.node],
                    ["drawContext", view.draw],
                ]),
                new Map([["parent", update]])
            ).then(function (algebraTileMVU) {
                update({ action: "addTile", algebraTileMVU });
                //algebraTileMVU.view.render();
            });
            function update(message) {
                if (message.action === "addTile") {
                    view.addTileView(message.algebraTileMVU.view);
                } else if (message.action === "add") {
                    model
                        .getSpace(message.spaceId)
                        .addTile(model.getTile(message.tileId));
                } else if (message.action === "remove") {
                    model
                        .getSpace(message.spaceId)
                        .removeTile(model.getTile(message.tileId));
                } else if (message.action === "createTile") {
                    model.createTile(message.tileId, message.tileValue);
                } else if (message.action === "createSpace") {
                    model.createSpace(message.spaceId);
                }
                view.placeTiles(model);
                return true;
            }
            return { model, view, update };
        });
    });
}

export { init };
