import { any, all, dom, mapReplacer, loadResource } from "../lib/common.js";

import { init as initTexTile } from "./TexTileSvg.js";
const doClone = false;
const displace = true;
const minStack = 0;

function capitalize(string) {
    if (!string) return string;
    return string[0].toUpperCase() + string.slice(1);
}

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

function SpaceView(space, update) {
    //const spaceId = svgElmt.getAttribute("data-space-id");
    const contents = [];
    const spaceView = {
        //spaceId,
        //svgElmt: svgElmt,
        contents,
        insertTileView,
        removeTileView,
    };
    function insertTileView(tileView) {
        tileView.assignedSpaceId = spaceId;
        contents.push(tileView);
        /*
        spaceView.svgElmt.appendChild(tileView.svgElmt);
        tileView.svgElmt.transform.baseVal
            .getItem(0)
            .setTranslate(
                (spaceView.svgElmt.getBBox().width -
                    tileView.svgElmt.getBBox().width) /
                    2,
                0
            );
            */
    }
    function removeTileView(tileView) {
        contents.splice(contents.indexOf(tileView), 1);
    }
    function mapToSvgElmt(svgElmt) {
        spaceView.svgElmt = svgElmt;
    }
    return spaceView;
}
function TileView(tile, update, source = null) {
    const tileView = Object.create(null);
    Object.assign(tileView, {
        assignedSpaceId: undefined,
        isClone: false,
        ...source,
    });
    Object.setPrototypeOf(tileView, TileView.prototype);
    //const tileId = svgElmt.getAttribute("data-tile-id");
    var transform;
    Object.assign(tileView, {
        x: 0,
        y: 0,
        /*originalParent: svgElmt.parentElement,
        origin: svgElmt.transform.baseVal.initialize(
            svgElmt.closest("svg").createSVGTransform()
        ),
        */
        transform,
        move,
        clone,
        reset,
        remove,
        hide,
        show,
        makeDraggable,
        mapToSvgElmt,
        getTile,
    });
    function getTile() {
        return tile;
    }
    function mapToSvgElmt(svgElmt) {
        tileView.svgElmt = svgElmt;
        transform = tileView.svgElmt.getScreenCTM().inverse();
        //svgElmt.setAttribute("data-tile-index", index);
        transform.e = transform.f = 0;
    }
    function makeDraggable() {
        var dropzone;
        function dragMoveListener(event) {
            tileView.move(tileView.x + event.dx, tileView.y + event.dy);
            // Another approach would be to register this listener in the view itself.
        }
        function dragEndListener(event) {
            if (!event.hasOwnProperty("dropzone")) {
                if (tileView.assignedSpaceId !== undefined) {
                    update({
                        action: "remove",
                        spaceId: tileView.assignedSpaceId,
                        tileId: tileView.tileId,
                    });
                }
            } else {
                // Remove a tile view from previously-assigned space id
                if (tileView.assignedSpaceId !== undefined) {
                    update({
                        action: "remove",
                        spaceId: tileView.assignedSpaceId,
                        tileId: tileView.tileId,
                    });
                }
                const toSpaceId = event.dropzone.target.getAttribute(
                    "data-space-id"
                );
                return update({
                    action: "getUpdateSpace",
                    dropzone: event.dropzone.target,
                }).then(function (updateSpace) {
                    return updateSpace({
                        action: "addTile",
                        tile: tileView.getTile(),
                    });
                });
                /*
                const success = update({
                    action: "add",
                    spaceId: toSpaceId,
                    tileId: tileView.tileId,
                });
                */
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
                tileViewClone.makeDraggable();
            });
        }
    }
    function hide() {
        tileView.svgElmt.style.display = "none";
    }
    function show() {
        tileView.svgElmt.style.display = "block";
    }
    function remove() {
        tileView.svgElmt.remove();
    }
    function clone(parentElement = tileView.svgElmt.parentElement) {
        const clone = TileView(
            parentElement.appendChild(tileView.svgElmt.cloneNode(true)),
            update,
            tileView
        );
        clone.isClone = true;
        return clone;
    }
    function move(x, y) {
        tileView.x = x;
        tileView.y = y;
        const dA = new DOMPoint(x, y);
        const dB = dA.matrixTransform(transform);
        // translate the element
        tileView.svgElmt.transform.baseVal.getItem(0).setTranslate(dB.x, dB.y);
    }
    function reset() {
        if (tileView.isClone) {
            tileView.svgElmt.remove();
        } else {
            tileView.originalParent.appendChild(tileView.svgElmt);
            tileView.x = tileView.y = 0;
            tileView.svgElmt.transform.baseVal.initialize(
                tileView.svgElmt.closest("svg").createSVGTransform()
            );
        }
    }
    (function fillBackground() {
        const rect = tileView.svgElmt?.querySelector("rect");
        if (rect === undefined) return;
        rect.style.fill = "white";
        svgElmt.insertBefore(rect, tileView.svgElmt.firstChild); // Place the background rect at the beginning of the tile's group element so that the foreground text is visible.
    })();
    return tileView;
}

function View(model, update) {
    const view = Object.create(null);
    Object.setPrototypeOf(view, View.prototype);
    const rootElement = document.createElement("div");
    const tileViewMap = new Map();
    const spaceViewMap = new Map();
    const dropzoneUpdateSpaceMap = new Map();
    /*
    var scale = 50;
    const width = 10;
    const height = 15;
    const boundingRect = {
        x: 0,
        y: 0,
        height: height * scale,
        width: width * scale,
    };
    */
    var i = 0;
    SVG.wrap = function (node) {
        /* Wrap an existing node in an SVG.js element. This is a slight hack
         * because svg.js does not (in general) provide a way to create an
         * Element of a specific type (eg SVG.Ellipse, SVG.G, ...) from an
         * existing node and still call the Element's constructor.
         *
         * So instead, we call the Element's constructor and delete the node
         * it created (actually, just leaving it to garbage collection, since it
         * hasn't been inserted into the doc yet), replacing it with the given node.
         *
         * Returns the newly created SVG.Element instance.
         */
        if (node.length) node = node[0]; // Allow using with or without jQuery selections
        var element_class = capitalize(node.nodeName);
        try {
            var element = new SVG[element_class]();
        } catch (e) {
            throw "No such SVG type '" + element_class + "'";
        }
        element.node = node;
        return element;
    };
    function addSpaceView(spaceView) {
        spaceViewMap.set(spaceView.spaceId, spaceView);
    }
    function drawBox(group, x, y, l, w, fill = "none") {
        const drawing = group.rect(l, w).attr({
            stroke: "black",
            "fill-opacity": 100,
            fill,
            x: x,
            y: y,
            cursor: "pointer",
        });
        return drawing;
    }
    function drawBlankTile() {
        const bbox = view.svgElmt.getBBox();
        const g = view.draw.group();
        g.translate(0, bbox.y + bbox.height);
        g.attr("baseline", "center");
        drawBox(g, 0, 0, view.scale, view.scale, "white");
        return g;
    }
    function useSvgAsTileView(tile, updateTile, svgElmt) {
        const tileView = new TileView(tile, updateTile);
        const blankTile = drawBlankTile();
        svgElmt.id = `asfajlxcv${i++}`;
        const tileContent = blankTile.group();
        tileContent.use(svgElmt.id); //tileView.svgElmt);
        const blankTileBBox = blankTile.node.getBBox();
        const tileContentBBox = tileContent.node.getBBox();
        tileContent.translate(
            0.5 * (blankTileBBox.width - tileContentBBox.width),
            0.5 * (blankTileBBox.height - tileContentBBox.height)
        );
        const scale = Math.min(
            0.8 *
                (blankTile.node.getBBox().width /
                    tileContent.node.getBBox().width),
            10
        );
        tileContent.scale(scale);
        tileView.svgElmt = blankTile.node;
        tileView.svgElmt.transform.baseVal.initialize(
            view.svgElmt.createSVGTransform()
        );
        tileView.mapToSvgElmt(blankTile.node);
        /*
        tileView.svgElmt.transform.baseVal.appendItem(
            view.svgElmt.createSVGTransform()
        );
        */
        tileView.move(0, 0);
        tileView.makeDraggable();
    }
    function addTileView(tileView) {
        rootElement.appendChild(tileView.rootElement);
        const blankTile = drawBlankTile();
        tileView.render().then(function () {
            tileViewMap.set(tileView.tileId, tileView);
            tileView.makeDraggable();
            if (tileView.svgElmt) {
                tileView.svgElmt.id = `asfajlxcv${tileView.tileId}`;
                //const tileViewNode = dom("use", { href: tileView.svgElmt.id });
                const scaleFactor = 1;
                const tileViewBBox = tileView.svgElmt.getBBox();
                //const scaleFactor = Math.min(tileViewBBox.width);
                const tileContent = blankTile.group();
                tileContent.scale(2);
                const clonedTileViewNode = tileContent.use(tileView.svgElmt.id); //tileView.svgElmt);
                tileView.svgElmt = blankTile.node;
                tileView.svgElmt.transform.baseVal.appendItem(
                    view.svgElmt.createSVGTransform()
                );
                tileView.move(0, 0);
                //tileView.svgElmt.transform(`scale(${scaleFactor})`);
                tileView.makeDraggable();
                tileViewMap.set(tileView.tileId, tileView);
                //makeTileViewDraggable(view, tileViewNode, update);
            }
        });
    }
    function addTarget(target) {
        //target.id = "target";
        view.draw = SVG.wrap(target);
        view.svgElmt = view.draw.node;
        const bbox = target.querySelector(".dropzone").getBBox();
        view.scale = Math.min(bbox.width, bbox.height);
        //draw.svg(target.htmlContent);
        /*
        draw.node.appendChild(
            dom("use", { href: target.id, x: 2, y: 2, width: 5, height: 5 })
        );
        */
        Array.from(view.svgElmt.querySelectorAll("svg .dropzone"))
            .sort(function (a, b) {
                return (
                    Number(a.getAttribute("data-space-id")) -
                    Number(b.getAttribute("data-space-id"))
                );
            })
            .map(function (spaceViewSvgElmt) {
                update({
                    action: "createSpace",
                    dropzone: spaceViewSvgElmt,
                    spaceId: spaceViewSvgElmt.getAttribute("data-space-id"),
                }).then(function (spaceMVU) {
                    spaceMVU.update({
                        action: "mapSpaceToDom",
                        element: spaceViewSvgElmt,
                    });
                });
                interact(spaceViewSvgElmt)
                    .dropzone({
                        overlap: 0.01,
                    })
                    .on("dropactivate", function (event) {
                        event.target.classList.add("drop-activated");
                    });
            });
        /*
        Array.from(rootElement.querySelectorAll("svg .draggable")).map(
            function (tileViewSvgElmt, index) {
                const tileValue = tileViewSvgElmt.getAttribute("data-value");
                tileViewSvgElmt.setAttribute("data-tile-id", index);
                const tileView = new TileView(tileViewSvgElmt, update);
                addTileView(tileView);
                update(
                    {
                        action: "createTile",
                        tileId: tileView.tileId,
                        tileValue: tileValue,
                    },
                    view
                );
                makeTileViewDraggable(view, tileView, update);
            }
        );
        */
        Array.from(spaceViewMap.values()).map(function (spaceView) {
            interact(spaceView.svgElmt)
                .dropzone({
                    overlap: 0.01,
                })
                .on("dropactivate", function (event) {
                    event.target.classList.add("drop-activated");
                });
        });
    }

    function getSpaceViews(spaceId) {
        return spaceViewMap.get(spaceId) || [];
    }
    const feedback = document.createElement("div");
    function render() {
        return new Promise(function (resolve) {
            rootElement.appendChild(feedback);
            resolve(view);
        });
    }
    const placedTileViewsMap = new Map();
    function placeTiles(model) {
        // Generate a mapping from tile ids to tile views that are free to be placed in space views.
        // Populate spaces with tiles from freeTileViewMap
        clearTiles(model);
        Array.from(model.data.spaceMap.values()).forEach(function (space) {
            space.contents.forEach(function (tile) {
                //placedTileViewsMap.set(tile.id, []);
                const spaceView = spaceViewMap.get(space.id);
                const tileView = tileViewMap.get(tile.id);
                spaceView.insertTileView(tileView);
                //    placedTileViewsMap.get(tile.id).push(tileViewClone);
            });
        });
        /*
        tileViewMap.forEach(function (tileView, tileId) {
            if (placedTileViewsMap.get(tileId)?.length > 0) {
                tileView.hide();
            } else {
                tileView.show();
            }
        });
        */
    }
    function clearTiles() {
        placedTileViewsMap.forEach(function (placedTileViews) {
            placedTileViews.forEach(function (placedTileView) {
                placedTileView.remove();
            });
        });
        placedTileViewsMap.clear();
    }
    return Object.assign(view, {
        rootElement,
        render,
        placeTiles,
        getSpaceViews,
        addTileView,
        useSvgAsTileView,
        addTarget,
        dropzoneUpdateSpaceMap,
    });
}
function Space(paramsMap) {
    const space = {
        id: paramsMap.get("id"),
        isFull,
        addTile,
        removeTile,
        content: [],
    };
    function isFull() {
        return space.content.length > 0;
    }
    function addTile(tile) {
        if (isFull() && displace) {
            space.content.splice(0, 1);
        }
        if (!isFull()) {
            space.content.push(tile);
        }
    }
    function removeTile(tile) {
        space.content.splice(space.content.indexOf(tile), 1);
    }
    return space;
}
function Tile(paramsMap) {
    const tile = {
        value: paramsMap.get("value"),
        reset,
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
    return tile;
}
function initSpace(paramsMap, updateParentServices) {
    const space = new Space(paramsMap);
    const spaceView = new SpaceView(space, update);
    const updateParent = updateParentServices.get("parent");
    function update(message) {
        if (message.action === "addTile") {
            space.addTile(message.tile);
            return updateParent({ action: "updateInput" });
        }
        return updateParent(message);
    }
    return Promise.resolve({ model: space, view: spaceView, update });
}

function Model(paramsMap) {
    const spaces = new Map();
    const model = Object.create(null);
    Object.setPrototypeOf(model, Model.prototype);
    const updateHandlers = [];
    const data = { tileMap: new Map(), spaceMap: new Map() };
    function addSpace(space) {
        spaces.set(space.id, space);
    }
    function addTileToSpace(spaceId, tile) {
        data.spaceMap.get(spaceId).contents.push(tile);
    }
    function removeTileFromSpace(spaceId, tile) {
        const space = data.spaceMap.get(spaceId);
        if (space.contents.includes(tile)) {
            space.contents.splice(space.contents.indexOf(tile), 1);
        }
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
            Object.assign(model, {
                data,
                spaces,
                exportModel,
                areSpacesFull,
                //addUpdateHandler,
                //createSpace,
                //createTile,
                getSpace,
                getTile,
                findSpaceContaining,
                addSpace,
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
            return { model, view, update };
            function update(message) {
                if (message.action === "addTile") {
                    //model.addTile(message.tileMVU.model);
                    const tileMVU = message.tileMVU;
                    /*
                    const tileView = new TileView(
                        tileMVU.model,
                    );
                    */
                    //tileView.useSvgElmt(tileMVU.view.svgElmt);
                    view.useSvgAsTileView(
                        tileMVU.model,
                        function (message) {
                            if (message.action === "getUpdateSpace") {
                                return Promise.resolve(
                                    view.dropzoneUpdateSpaceMap.get(
                                        message.dropzone
                                    )
                                );
                            } else {
                                return tileMVU.update();
                            }
                        },
                        tileMVU.view.svgElmt
                    );
                } else if (message.action === "add") {
                    model
                        .getSpace(message.spaceId)
                        .addTile(model.getTile(message.tileId));
                    updateParent({ action: "setInput", model });
                } else if (message.action === "remove") {
                    model
                        .getSpace(message.spaceId)
                        .removeTile(model.getTile(message.tileId));
                } else if (message.action === "createTile") {
                    model.createTile(message.tileId, message.tileValue);
                    view.addTileView(message.tileMVU.view);
                } else if (message.action === "createSpace") {
                    return initSpace(
                        new Map([["id", message.spaceId]]),
                        new Map([...updateParentServices, ["parent", update]])
                    ).then(function (spaceMVU) {
                        model.addSpace(spaceMVU.model);
                        view.dropzoneUpdateSpaceMap.set(
                            message.dropzone,
                            spaceMVU.update
                        );
                        return spaceMVU;
                    });
                } else if (message.action === "updateInput") {
                    updateParent({ action: "setInput", model: model });
                }
                view.placeTiles(model);
                return true;
            }
        });
    });
}

export { init };
