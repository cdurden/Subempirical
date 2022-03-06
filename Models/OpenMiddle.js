import { all, getFile } from "../common.js";
//const omtex = ("\\displaylines{\\frac{x^{\\omspace{0}}}{x^{\\omspace{1}}} < x^{\\left(\\frac{\\omspace{2}}{\\omspace{3}}\\right)} < \\frac{x^{\\omspace{4}}}{x^{\\omspace{5}}} \\\\ \\omtile{0} \\omtile{1} \\omtile{2} \\omtile{3} \\omtile{4} \\omtile{5} \\omtile{6} \\omtile{7} \\omtile{8} \\omtile{9}}");

// MathJax-related utility functions
function insertMath(tex, container) {
    const mathJaxElement = document.createElement("div");
    mathJaxElement.style["font-size"] = "48pt";
    mathJaxElement.innerHTML = `\\(${tex}\\)`;
    container.appendChild(mathJaxElement);
    return mathJaxElement;
}

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
function generateSpace(svgElmt, content = null) {
    return {
        content,
        svgElmt,
    };
}
// Constants

function TileModel(spaces, tiles) {
    const self = Object.create(null);
    const updateHandlers = [];
    const model = { spaces, tiles };
    const tile = tiles[0];
    const transform = tile.getScreenCTM().inverse();
    transform.e = transform.f = 0;
    Object.setPrototypeOf(self, TileModel.prototype);

    function fillSpace(tileIndex, spaceIndex) {
        model.spaces[spaceIndex].content = tiles[tileIndex];
        updateHandlers.forEach(function (updateHandler) {
            updateHandler(model);
        });
    }
    function emptySpace(spaceIndex) {
        model.spaces[spaceIndex].content = null;
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
    function setupDragging() {
        const feedback = document.createElement("div");
        function dragStartListener(event) {
            var target = event.target,
                // keep the dragged position in the data-x/data-y attributes
                x = parseFloat(target.getAttribute("origin-x")) || 0,
                y = parseFloat(target.getAttribute("origin-y")) || 0;

            // update the posiion attributes
            target.setAttribute("origin-x", x);
            target.setAttribute("origin-y", y);
        }
        function dragMoveListener(event) {
            var target = event.target,
                // keep the dragged position in the data-x/data-y attributes
                x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
                y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

            const dA = new DOMPoint(x, y);
            const dB = dA.matrixTransform(transform);
            // translate the element
            target.style.webkitTransform = target.style.transform =
                "translate(" + dB.x + "px, " + dB.y + "px)";

            if (event.dragEnter) {
                target.setAttribute("data-dropzone", event.relatedTarget); // FIXME: Is the relatedTarget equal to the dropzone for such an event?
            }
            if (event.dragLeave) {
                target.removeAttribute("data-dropzone");
            }
            // update the position attributes
            target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);
        }
        function dragEndListener(event) {
            var target = event.target;
            var x, y;
            // keep the dragged position in the data-x/data-y attributes
            if (!target.hasAttribute("data-dropzone")) {
                x = parseFloat(target.getAttribute("origin-x")) || 0;
                y = parseFloat(target.getAttribute("origin-y")) || 0;
                const dA = new DOMPoint(x, y);
                const dB = dA.matrixTransform(transform);
                // translate the element
                target.style.webkitTransform = target.style.transform =
                    "translate(" + dB.x + "px, " + dB.y + "px)";
                target.setAttribute("data-x", x);
                target.setAttribute("data-y", y);
                const spaceIndex = target.getAttribute("data-space-index");
                if (spaceIndex !== null) {
                    emptySpace(spaceIndex);
                }
            }
        }
        interact(".openMiddleTile").draggable({
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
            onstart: dragStartListener,
            // call this function on every dragmove event
            onmove: dragMoveListener,
            // call this function on every dragend event
            onend: dragEndListener,
        });
        spaces.forEach(function (space, index) {
            interact(`#openMiddleSpace${index}`) // FIXME: Can we use the element directly here?
                .dropzone({
                    overlap: 0.01,
                    ondrop: function (event) {
                        // Remove electron from donating shell
                        if (
                            event.target.parentNode.contains(
                                event.relatedTarget
                            )
                        )
                            return;
                        //event.relatedTarget.setAttribute("data-dropzone", event.target);
                        const fromTileIndex = event.relatedTarget.getAttribute(
                            "data-tile-index"
                        );
                        const toSpaceIndex = event.target.getAttribute(
                            "data-space-index"
                        );
                        fillSpace(fromTileIndex, toSpaceIndex);
                        event.relatedTarget.setAttribute(
                            "data-space-index",
                            toSpaceIndex
                        );
                        // Update feedback
                        feedback.textContent = areSpacesFilled()
                            ? "All spaces are filled"
                            : "A space is not filled";
                    },
                })
                .on("dropactivate", function (event) {
                    event.target.classList.add("drop-activated");
                });
        });
    }
    return Object.assign(self, {
        getModelData,
        exportModel,
        fillSpace,
        emptySpace,
        areSpacesFilled,
        addUpdateHandler,
        setupDragging,
    });
}

function main(paramsMap, onUpdate) {
    const userStats = {
        email: "test@oddities.org",
        responses: [[1, 1]],
    };
    const container = document.getElementById("virginia-content");
    getFile(paramsMap.get("file")).then(function (response) {
        typeset(function () {
            return [insertMath(response.data, container)];
        }).then(function (mathJaxElements) {
            mathJaxElements.forEach(function (mathJaxElement) {
                const feedback = document.createElement("div");
                container.appendChild(feedback);
                const spaceIds = Array.from(
                    mathJaxElement.querySelectorAll("[id^='openMiddleSpace']")
                )
                    .reduce(function (ids, elmt) {
                        if (!ids.includes(elmt.id)) {
                            return ids.concat([elmt.id]);
                        } else {
                            return ids;
                        }
                    }, [])
                    .sort();
                const spaces = spaceIds.map(function (spaceId, index) {
                    const space = generateSpace(
                        document.getElementById(spaceId)
                    );
                    space.svgElmt.setAttribute("data-space-index", index);
                    return space;
                });
                const svgElmt = spaces[0].svgElmt.closest("SVG");
                const tiles = svgElmt.querySelectorAll(".openMiddleTile");
                // Set the tile background to filled so that it can be dragged from any point in its interior
                tiles.forEach(function (tile, index) {
                    tile.setAttribute("data-tile-index", index);
                    const rect = tile.querySelector("rect");
                    if (rect === null) return;
                    rect.style.fill = "white";
                    tile.insertBefore(rect, tile.firstChild); // Place the background rect at the beginning of the tile's group element so that the foreground text is visible.
                });
                const model = new TileModel(spaces, tiles);
                if (onUpdate instanceof Function) {
                    model.addUpdateHandler(onUpdate);
                }
                model.setupDragging();
            });
        });
    });
}
export { main };
