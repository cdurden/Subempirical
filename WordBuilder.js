import { any, all, getFile, mapReplacer } from "../common.js";
// Constants
function Controller(model, view) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Controller.prototype);
    function bind() {
        function dragMoveListener(event) {
            const partIndex = event.target.getAttribute("data-part-index");
            view.movePart(partIndex, event.dx, event.dy);
        }
        function dragEndListener(event) {
            const partIndex = event.target.getAttribute("data-part-index");
            if (!event.hasOwnProperty("dropzone")) {
                model.removePart(partIndex);
            }
            view.returnPart(partIndex); // FIXME: This should not be necessary
        }
        view.getParts().forEach(function (part) {
            interact(part.domElmt).draggable({
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
        interact(view.getWord())
            .dropzone({
                overlap: 0.01,
                ondrop: function (event) {
                    const partIndex = event.relatedTarget.getAttribute(
                        "data-part-index"
                    );
                    model.appendPart(partIndex);
                },
            })
            .on("dropactivate", function (event) {
                event.target.classList.add("drop-activated");
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
    var parts;
    var word;
    function getParts() {
        return parts;
    }
    function getWord() {
        return word;
    }
    function returnPart(index) {
        parts[index].domElmt.style.position = "relative";
        parts[index].x = parts[index].y = 0;
    }
    function updateParts(model) {
        parts
            .filter(function (part, partIndex) {
                return model.word.includes(partIndex);
            })
            .sort(function (a, b) {
                return model.word.indexOf(a) - model.word.indexOf(b);
            })
            .forEach(function (part, partIndex) {
                word.appendChild(part.domElmt);
            });
    }
    function movePart(index, dx, dy) {
        const dA = new DOMPoint((parts[index].x += dx), (parts[index].y += dy));
        // translate the element
        const domElmt = parts[index].domElmt;
        domElmt.style.position = "absolute";
        domElmt.style.webkitTransform = domElmt.style.transform =
            "translate(" + dA.x + "px, " + dA.y + "px)";
    }
    function render() {
        return new Promise(function (resolve) {
            word = document.createElement("div");
            word.setAttribute("class", "word-container");
            rootElement.appendChild(word);
            const partsContainer = document.createElement("div");
            partsContainer.setAttribute("class", "tile-container");
            rootElement.appendChild(partsContainer);
            parts = model.getModelData().parts.map(function (part, partIndex) {
                const domElmt = document.createElement("div");
                domElmt.setAttribute("class", "tile");
                domElmt.setAttribute("data-part-index", partIndex);
                domElmt.textContent = part;
                partsContainer.appendChild(domElmt);
                model.finalize(self);
                resolve(self);
                const rect = domElmt.getBoundingClientRect();
                return {
                    x: 0,
                    y: 0,
                    domElmt,
                };
            });
        });
    }
    return Object.assign(self, {
        rootElement,
        render,
        returnPart,
        movePart,
        updateParts,
        getWord,
        getParts,
    });
}

function Model(paramMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const updateHandlers = [];
    const model = { word: [] };
    function finalize(view) {}
    function emptySpace(spaceIndex) {
        model.spaces[spaceIndex].content = null;
        updateHandlers.forEach(function (updateHandler) {
            updateHandler(model);
        });
    }
    function appendPart(partIndex) {
        model.word.push(Number(partIndex));
        updateHandlers.forEach(function (updateHandler) {
            updateHandler(model);
        });
    }
    function removePart(partIndex) {
        model.word.splice(model.word.indexOf(partIndex), 1);
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
            model.parts = response.data.parts;
            resolve(
                Object.assign(self, {
                    getModelData,
                    exportModel,
                    removePart,
                    appendPart,
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
            mvc.model.addUpdateHandler(view.updateParts);
            const exportModelLink = document.createElement("a");
            exportModelLink.textContent = "Export";
            exportModelLink.addEventListener("click", mvc.model.exportModel);
            container.appendChild(exportModelLink);
        });
    });
}
export { init, main, Model };
