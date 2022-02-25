// Utility functions
function all(bools) {
    return bools.reduce((acc, bool) => acc && bool, true);
}
// Parsing functions
// Taken from https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
function mapReplacer(key, value) {
    if (value instanceof Map) {
        return {
            data: Array.from(value.entries()), // or with spread: value: [...value]
            dataType: "Map",
        };
    } else {
        return value;
    }
}

function mapReviver(key, value) {
    if (typeof value === "object" && value !== null) {
        if (value.dataType === "Map") {
            return new Map(value.data);
        }
    }
    return value;
}

// Constants

// Model-building utility functions
function take(n, elmts) {
    const results = [];
    elmts.forEach(function (elmt, i) {
        if (i < n) results.push(elmt);
    });
    return results;
}

function generateSpace(x, y, content = null) {
    return {
        content,
        x,
        y,
     }
}

function TileModel(spaces, tiles) {
    const self = Object.create(null);
    const updateHandlers = [];
    const model = { spaces, tiles };
    Object.setPrototypeOf(self, TileModel.prototype);

    function generateTile(x, y, label) {
        if (tiles.has(label)) {
            return tiles.get(label);
        } else {
            return {
                label,
                x,
                y,
            };
        }
    }

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

    function exportModel() {
        const blob = new Blob([JSON.stringify(model, mapReplacer)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.setAttribute("href", url);
        anchor.setAttribute("download", `model.json`);
        const clickHandler = () => {
            setTimeout(() => {
                URL.revokeObjectURL(url);
                anchor.removeEventListener("click", clickHandler);
            }, 150);
        };
        anchor.addEventListener("click", clickHandler, false);
        anchor.click();
    }

    // Drawing functions
    function drawBox(group, w, h, labelText="") {
        const label = group.text(function (add) {
            add.tspan(labelText)
                .font({
                    anchor: "middle",
                    size: 24,
                    family: "Helvetica",
                });
            });
        });
        label.leading(1.3);
        group.rect(w, h).attr({ fill: "none", stroke: "black" }).center(0, 0);
        return group;
    }

    function drawModel(draw, scale) {
        model.spaces.forEach(function (space, spaceIndex) {
            const spaceGroup = drawBox(
                draw.group(),
                100,
                100,
            );
            spaceGroup.data("space-index", spaceIndex);
            spaceGroup.center(space.x, space.y); //FIXME: Are these coordinates in user space? If so, we might need to set the svg viewBox
        });
    }
    function addUpdateHandler(updateHandler) {
        updateHandlers.push(updateHandler);
    }
    return Object.assign(self, {
        drawModel,
        getBoundingRect,
        exportModel,
        fillSpace,
        emptySpace
        areSpacesFilled,
        addUpdateHandler,
    });
}

// Interact functions
function dragStartListener(event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = parseFloat(target.getAttribute("origin-x")) || 0,
        y = parseFloat(target.getAttribute("origin-y")) || 0;

    // update the posiion attributes
    //target.setAttribute("origin-x", x);
    //target.setAttribute("origin-y", y);
}
function dragMoveListener(event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
        y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform = target.style.transform =
        "translate(" + x + "px, " + y + "px)";

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
        target.style.webkitTransform = target.style.transform =
            "translate(" + x + "px, " + y + "px)";
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);
    } else {
        x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
        y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
        target.setAttribute("origin-x", x);
        target.setAttribute("origin-y", y);
    }
}
function reviver(key, value) {
    if (key === "") {
        const BrutusinForms = brutusin["json-forms"];
        BrutusinForms.addDecorator(function (element, schema) {
            if (element.tagName) {
                var tagName = element.tagName.toLowerCase();
                if (tagName === "select") {
                    if (schema?.prompt) {
                        var prompt = document.createElement("span");
                        prompt.textContent = schema.prompt;
                        element.parentNode.insertBefore(prompt, element);
                        prompt.setAttribute("style", "margin: 5px;");
                        prompt.className = "prompt";
                        console.log(schema.prompt);
                    }
                }
            }
        });
        const data = {};
        return {
            render: function (container) {
                const bf = BrutusinForms.create(value);
                bf.render(container, data);
                const submitButton = document.createElement("button");
                submitButton.addEventListener("click", function () {
                    const data = bf.getData();
                    const urlParams = new URLSearchParams(
                        window.location.search
                    );
                    axios
                        .post(value["$id"], data, {
                            params: { dropboxId: urlParams.get("dropboxId") },
                        })
                        .then(function (response) {
                            window.location.href = urlParams.get("redirectUrl");
                        });
                });
                submitButton.innerHTML = "Submit";
                container.appendChild(submitButton);
            },
        };
    } else {
        return value;
    }
}

function main(onUpdate) {
    const scale = 100; // length corresponding to 1 ångström in screen coordinates
    const model = new TileModel(structure);
    if (onUpdate instanceof Function) {
        model.addUpdateHandler(onUpdate);
    }
    model.scaleXYZ(scale);
    const container = document.getElementById("virginia-content");
    const feedback = document.createElement("div");
    container.appendChild(feedback);
    const exportButton = document.createElement("div");
    const exportButtonLink = document.createElement("a");
    exportButtonLink.addEventListener("click", model.exportModel);
    exportButtonLink.textContent = "Export";
    exportButton.appendChild(exportButtonLink);
    container.appendChild(exportButton);
    const boundingRect = model.getBoundingRect(1.5 * scale);
    const width = boundingRect.width;
    const height = boundingRect.height;
    const draw = SVG()
        .addTo(container)
        .size(width, height)
        .viewbox(boundingRect);
    model.drawModel(draw, scale);
    /*
    const hydrogen = drawLewisDotStructure(draw.group(), 1, 100);
    hydrogen.center(150, 150);
    const flourine = drawLewisDotStructure(draw.group(), 9, 100, -Math.PI / 2);
    flourine.center(450, 150);
    */
    interact(".draggable").draggable({
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
    interact(".dropzone")
        .dropzone({
            overlap: 0.01,
            ondrop: function (event) {
                // Remove electron from donating shell
                if (event.target.parentNode.contains(event.relatedTarget))
                    return;
                // Set the data-dropzone attribute so that the drag listener will not move the electron back where it started
                // FIXME: It's possible that the dragend listener might fire before this, in which case the position could be set incorrectly
                // FIXME: Why is this even necessary?
                event.relatedTarget.setAttribute("data-dropzone", event.target);
                const fromAtomIndex = event.relatedTarget.parentElement.getAttribute(
                    "data-atom-index"
                );
                const toAtomIndex = event.target.parentElement.getAttribute(
                    "data-atom-index"
                );
                model.transferElectron(fromAtomIndex, toAtomIndex);
                /*
                const fromElectrons = JSON.parse(
                    event.relatedTarget.parentElement.getAttribute(
                        "data-electrons"
                    )
                );
                fromElectrons.pop();
                event.relatedTarget.parentElement.setAttribute(
                    "data-electrons",
                    JSON.stringify(fromElectrons)
                );
                // Add electron to receiving shell
                const electrons = JSON.parse(
                    event.target.parentElement.getAttribute("data-electrons")
                );
                const nextElectronIndex = Math.max(
                    0,
                    ...electrons.map(function (state) {
                        return state.index + 1;
                    })
                );
                const nextEnergyState = electronStates[nextElectronIndex];
                electrons.push(nextEnergyState);
                event.target.parentElement.setAttribute(
                    "data-electrons",
                    JSON.stringify(electrons)
                );
                */
                // Move electron's circle element
                event.target.parentElement.appendChild(event.relatedTarget);
                // Update feedback
                feedback.textContent = model.areShellsFull()
                    ? "All shells are full"
                    : "A shell is not full";
            },
        })
        .on("dropactivate", function (event) {
            event.target.classList.add("drop-activated");
        });
}
export { main };
