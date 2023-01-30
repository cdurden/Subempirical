import { any, all, getFile, mapReplacer } from "../lib/common.js";
const doClone = false;
const displace = true;

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

function SpaceView(svgElmt) {
    const spaceId = svgElmt.getAttribute("data-space-id");
    const spaceView = {
        spaceId,
        svgElmt: svgElmt,
        //addTile,
        //removeTile,
        contents: new Map(),
    };
    /*
        function addTile(tile) {
            if (spaceContentsMap.has(space)) {
                spaceContentsMap.get(space).push(tile);
            }
        }
        function removeTile(tile) {
            if (spaceContentsMap.has(space)) {
                const spaceTiles = spaceContentsMap.get(space);
                spaceTiles.splice(spaceTiles.indexOf(tile), 1);
            }
        }
        */
    return spaceView;
}
function makeTileViewDraggable(view, tileView, update) {
    var dropzone;
    function dragMoveListener(event) {
        tileView.move(tileView.x + event.dx, tileView.y + event.dy);
        // Another approach would be to register this listener in the view itself.
    }

    /*
    function removeTileViewFromSpaceViews(spaceId, tileId) {
        // Remove the tile view from all space views with the tile's assigned space id.
        view.getSpaceViews(spaceId).forEach(function (spaceView) {
            const tileView = spaceView.contents.get(tileId);
            spaceView.contents.delete(tileId);
            tileView.assignedSpaceId = undefined;
            tileView.reset();
        });
    }
    function addTileViewToSpaceViews(spaceId, tileView, target, clone = false) {
        view.getSpaceViews(spaceId).forEach(function (spaceView, index) {
            if (clone || spaceView.svgElmt !== target) {
                const tileViewClone = tileView.clone(spaceView.svgElmt);
                makeTileViewDraggable(view, tileViewClone, update);
                //tileViewClone.move(spaceView.svgElmt);
                spaceView.contents.set(tileView.tileId, tileViewClone);
            } else {
                spaceView.contents.set(tileView.tileId, tileView);
            }
        });
    }
    */
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
                /*
                removeTileViewFromSpaceViews(
                    tileView.assignedSpaceId,
                    tileView.tileId
                );
                */
            }
        } else {
            // Remove a tile view from previously-assigned space id
            /*
            if (tileView.assignedSpaceId !== undefined) {
                removeTileViewFromSpaceViews(
                    tileView.assignedSpaceId,
                    tileView.tileId
                );
            }
            */
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
            if (success) {
                tileView.assignedSpaceId = toSpaceId;
            }
            // If the space has multiple views, clone the tile view and move it to each one.
            //addTileViewToSpaceViews(toSpaceId, tileView, event.dropzone.target);
        }
        if (tileView.isClone) {
            // FIXME: Once updating tiles works, we either:
            // need to move this so that clones are always removed,
            // or configure the update handler to add extra clones as needed.
            tileView.remove();
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
            /*
                    interaction.start(
                        { name: "drag" },
                        event.interactable,
                        clone.svgElmt
                    );
                    */
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
    });
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

function View(update) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    const tileViewMap = new Map();
    const spaceViewMap = new Map();
    function addSpaceView(spaceView) {
        if (spaceViewMap.has(spaceView.spaceId)) {
            spaceViewMap.get(spaceView.spaceId).push(spaceView);
        } else {
            spaceViewMap.set(spaceView.spaceId, [spaceView]);
        }
    }
    function addTileView(tileView) {
        tileViewMap.set(tileView.tileId, tileView);
        /*
        if (tileViewMap.has(tileView.tileId)) {
            tileViewMap.get(tileView.tileId).push(tileView);
        } else {
            tileViewMap.set(tileView.tileId, [tileView]);
        }
        */
    }
    /*
    function getTileView(tileIndex) {
        return tileViews[tileIndex];
    }
    function getTileViews() {
        return tileViews;
    }
    */
    function getSpaceViews(spaceId) {
        return spaceViewMap.get(spaceId) || [];
    }
    /*
    function update(modelUpdate) {
        Array.from(modelUpdate.spaceViews.entries()).forEach(function ([
            spaceId,
            spaceModel,
        ]) {
            // Rectify the space's view with its model
            spaceViews.get(spaceId).views.forEach(function (spaceView) {
                // Clear the space's view
                spaceView.contents.forEach(function (tileView) {
                    if (tileView.isClone) {
                        tileView.remove();
                    }
                });
                // Add the tiles back based on the model
                spaceModel.contents.forEach(function (tileModel) {
                    const tileView = getTile(tileModel.index);
                    if (doClone) {
                        const clone = tileView.clone(spaceView.svgElmt);
                        spaceView.contents.push(clone);
                    } else {
                        //spaceView.svgElmt.appendChild(tile.svgElmt);
                        spaceView.contents.push(tileView);
                    }
                });
            });
        });
    }
    function getTile(index) {
        return tiles[index];
    }
    function getSpace(spaceId) {
        return spaceViews.get(spaceId);
    }
    */
    function render(model) {
        return new Promise(function (resolve) {
            typeset(function () {
                return [insertMath(model.data.omtex, rootElement)];
            }).then(function () {
                const feedback = document.createElement("div");
                rootElement.appendChild(feedback);
                Array.from(rootElement.querySelectorAll("svg .openMiddleSpace"))
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
                Array.from(
                    rootElement.querySelectorAll("svg .openMiddleTile")
                ).map(function (tileViewSvgElmt, index) {
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
                });
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
                //model.finalize(self);
                resolve(self);
            });
        });
    }
    // We have an array of arrays. Each element in the outer array corresponds to a space, and consists of a list of tiles.
    // Each
    function placeTiles(model) {
        // Generate a mapping from tile ids to tile views that are free to be placed in space views.
        const freeTileViewMap = new Map();
        tileViewMap.forEach(function (tileView, tileId) {
            freeTileViewMap.set(tileId, [tileView]);
        });
        Array.from(model.data.tileMap.values()).map(function (tile) {
            Array.from(model.data.spaceMap.values()).forEach(function (space) {
                const tileCount = Array.from(space.contents.values()).filter(
                    function (tileContent) {
                        return tileContent === tile;
                    }
                );
                const spaceViews = spaceViewMap.get(space.id);
                spaceViews.forEach(function (spaceView, index) {
                    const matchingTileViews = Array.from(
                        spaceView.contents.values()
                    ).filter(function (tileView) {
                        return tileView.tileId === tile.id;
                    });
                    while (matchingTileViews.length > tileCount) {
                        const extraTile = matchingTileViews.pop();
                        freeTileViewMap.get(tile.id).push(extraTile);
                        spaceView.removeTileView(extraTile);
                    }
                });
            });
        });
        // Populate spaces with tiles from freeTileViewMap
        Array.from(model.data.spaceMap.values()).forEach(function (space) {
            space.contents.forEach(function (tile) {
                const freeTileViews = freeTileViewMap.get(tile.id) ?? [];
                const spaceViews = spaceViewMap.get(space.id) ?? [];
                spaceViews.forEach(function (spaceView, index) {
                    if (freeTileViews.length > 0) {
                        const tileView = freeTileViews.pop();
                        spaceView.svgElmt.appendChild(tileView.svgElmt);
                        //tileView.move(spaceView.x, spaceView.y);
                    } else {
                        const tileView = tileViewMap.get(tile.id).clone();
                        makeTileViewDraggable(self, tileView, update);
                        //tileView.move(spaceView.x, spaceView.y);
                        spaceView.svgElmt.appendChild(tileView.svgElmt);
                    }
                });
            });
        });
        freeTileViewMap.forEach(function (tileViews) {
            tileViews.forEach(function (tileView, index) {
                tileView.reset();
            });
        });
    }
    return Object.assign(self, {
        rootElement,
        render,
        placeTiles,
        getSpaceViews,
        //getTile,
        //getTiles,
        //update,
        //getSpaces,
    });
}
function makeUpdateFunction(model) {
    return function update(message, view) {
        if (message.action === "add") {
            model
                .getSpace(message.spaceId)
                .addContent(model.getTile(message.tileId));
        } else if (message.action === "remove") {
            model
                .getSpace(message.spaceId)
                .removeContent(model.getTile(message.tileId));
        } else if (message.action === "createTile") {
            model.createTile(message.tileId, message.tileValue);
        } else if (message.action === "createSpace") {
            model.createSpace(message.spaceId);
        }
        view.placeTiles(model);
        return true;
    };
}

function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const updateHandlers = [];
    const data = { tileMap: new Map(), spaceMap: new Map() };
    function addContentToSpace(spaceId, tile) {
        data.spaceMap.get(spaceId).contents.push(tile);
    }
    function removeContentFromSpace(spaceId, tile) {
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
            addContent,
            removeContent,
        };
        const modelUpdate = {
            spaces: new Map([[space.id, space]]),
        };
        function isFull() {
            return space.contents.length > 0;
        }
        function addContent(content) {
            space.contents.push(content);
            /*
            updateHandlers.forEach(function (updateHandler) {
                updateHandler(modelUpdate);
            });
            */
        }
        function removeContent(content) {
            space.contents.splice(space.contents.indexOf(content), 1);
            /*
            updateHandlers.forEach(function (updateHandler) {
                updateHandler(modelUpdate);
            });
            */
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
        getFile(paramsMap.get("file")).then(function (response) {
            data.omtex = response.data;
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
        document.addEventListener(
            "DOMContentLoadedAndMathJaxReady",
            function () {
                mvu.view.render(mvu.model).then(function (view) {
                    const exportModelLink = document.createElement("a");
                    exportModelLink.textContent = "Export";
                    exportModelLink.addEventListener(
                        "click",
                        mvu.model.exportModel
                    );
                    container.appendChild(exportModelLink);
                });
            }
        );
    });
}
export { init, main, Model };
