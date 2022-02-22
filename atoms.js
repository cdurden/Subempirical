function parseXYZ(data) {
    const lines = data.split("\n").reverse();
    const n = parseInt(lines.pop());
    const comment = lines.pop();
    const structure = lines.map(function (line) {
        const [symbol, x, y, z] = line.split(/\s/);
        return {
            symbol,
            x,
            y,
            z,
        };
    });
    return {
        n,
        comment,
        structure,
    };
}
const skeletalStructure = parseXYZ(
    `2

H 1 1 0
F 3 1 0`
);
function getBoundingRectXY(xyData, scale = 1) {
    const box = xyData.structure.reduce(
        function (box, atom) {
            box.left = Math.min(box.left, atom.x);
            box.right = Math.max(box.right, atom.x);
            box.top = Math.min(box.top, atom.y);
            box.bottom = Math.max(box.bottom, atom.y);
            return box;
        },
        { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity }
    );
    const width = scale * (box.right - box.left);
    const height = scale * (box.bottom - box.top);
    const x = scale * box.left;
    const y = scale * box.top;
    return { x, y, width, height };
}

const elements = new Map([
    ["H", 1],
    ["He", 2],
    ["Li", 3],
    ["Be", 4],
    ["B", 5],
    ["C", 6],
    ["N", 7],
    ["O", 8],
    ["F", 9],
    ["Ne", 10],
    ["Na", 11],
    ["Mg", 12],
    ["Al", 13],
    ["Si", 14],
    ["P", 15],
    ["S", 16],
    ["Cl", 17],
    ["Ar", 18],
    ["K", 19],
    ["Ca", 20],
    ["Sc", 21],
    ["Ti", 22],
    ["V", 23],
    ["Cr", 24],
    ["Mn", 25],
    ["Fe", 26],
    ["Co", 27],
    ["Ni", 28],
    ["Cu", 29],
    ["Zn", 30],
    ["Ga", 31],
    ["Ge", 32],
    ["As", 33],
    ["Se", 34],
    ["Br", 35],
    ["Kr", 36],
    ["Rb", 37],
    ["Sr", 38],
    ["Y", 39],
    ["Zr", 40],
    ["Nb", 41],
    ["Mo", 42],
    ["Tc", 43],
    ["Ru", 44],
    ["Rh", 45],
    ["Pd", 46],
    ["Ag", 47],
    ["Cd", 48],
    ["In", 49],
    ["Sn", 50],
    ["Sb", 51],
    ["Te", 52],
    ["I", 53],
    ["Xe", 54],
    ["Cs", 55],
    ["Ba", 56],
    ["La", 57],
    ["Ce", 58],
    ["Pr", 59],
    ["Nd", 60],
    ["Pm", 61],
    ["Sm", 62],
    ["Eu", 63],
    ["Gd", 64],
    ["Tb", 65],
    ["Dy", 66],
    ["Ho", 67],
    ["Er", 68],
    ["Tm", 69],
    ["Yb", 70],
    ["Lu", 71],
    ["Hf", 72],
    ["Ta", 73],
    ["W", 74],
    ["Re", 75],
    ["Os", 76],
    ["Ir", 77],
    ["Pt", 78],
    ["Au", 79],
    ["Hg", 80],
    ["Tl", 81],
    ["Pb", 82],
    ["Bi", 83],
    ["Po", 84],
    ["At", 85],
    ["Rn", 86],
    ["Fr", 87],
    ["Ra", 88],
    ["Ac", 89],
    ["Th", 90],
    ["Pa", 91],
    ["U", 92],
    ["Np", 93],
    ["Pu", 94],
    ["Am", 95],
    ["Cm", 96],
    ["Bk", 97],
    ["Cf", 98],
    ["Es", 99],
    ["Fm", 100],
    ["Md", 101],
    ["No", 102],
    ["Lr", 103],
    ["Rf", 104],
    ["Db", 105],
    ["Sg", 106],
    ["Bh", 107],
    ["Hs", 108],
    ["Mt", 109],
    ["Ds", 110],
    ["Rg", 111],
    ["Uub", 112],
    ["Uuq", 114],
]);

const ns = [0, 1, 2, 3, 4, 5];
const electronStates = [];
ns.forEach(function (n) {
    const ls = Array.from({ length: n }, (_, i) => i);
    ls.forEach(function (l) {
        const ms = Array.from({ length: 2 * l + 1 }, (_, i) => i - l);
        ms.forEach(function (m) {
            electronStates.push({ n, l, m, s: 1 });
            electronStates.push({ n, l, m, s: -1 });
        });
    });
});
electronStates.sort(function (a, b) {
    return a.n + a.l - a.l / (a.l + 1) - (b.n + b.l - b.l / (b.l + 1));
});
Object.freeze(electronStates);
electronStates.forEach(function (state, index) {
    state.index = index;
    Object.freeze(state);
});
function take(n, elmts) {
    const results = [];
    elmts.forEach(function (elmt, i) {
        if (i < n) results.push(elmt);
    });
    return results;
}
function shell(electrons, n) {
    return electrons.filter(function (state) {
        return (
            (state.n == n && state.l == 0) || // s-block
            (state.n == n && state.l == 1) || // p-block
            (state.n == n - 1 && state.l == 2) || // d-block
            (state.n == n - 2 && state.l == 3) // f-block
        );
    });
}
function valenceShell(electrons) {
    const n = Math.max(
        0,
        ...electrons.map(function (state) {
            return state.n;
        })
    );
    return shell(electrons, n);
}
function isFullShell(electrons) {
    const n = Math.max(
        0,
        ...electrons.map(function (state) {
            return state.n;
        })
    );
    return electrons.length == shell(electronStates, n).length; // FIXME: This is not a rigorous test of equality
}

function exportModel(model) {
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

// FIXME: Retrieves data from model
// (Retrieves atomicSymbol)
function drawElementBox(group, atomicSymbol, w, h) {
    //const atomicSymbol = elements.get(atomicNumber);
    const atomicNumber = elements.get(atomicSymbol);
    console.log(atomicSymbol);
    const label = group.text(function (add) {
        add.tspan(atomicNumber)
            .font({
                anchor: "middle",
                size: 12,
                family: "Helvetica",
            })
            .dy(-10);
        add.tspan(function (addMore) {
            addMore.newLine();
            addMore
                .tspan(atomicSymbol)
                .font({
                    "alignment-baseline": "baseline",
                    anchor: "middle",
                    size: 24,
                    family: "Helvetica",
                })
                .dy(24);
        });
    });
    label.leading(1.3);
    group.rect(w, h).attr({ fill: "none", stroke: "black" }).center(0, 0);
    return group;
}

function drawShell(group, shell, r, theta0 = 0) {
    const orbit = group
        .circle(2 * r)
        .attr({ stroke: "black", fill: "none", cx: 0, cy: 0 });
    orbit.addClass("dropzone");
    group.data("electrons", shell);
    shell.forEach(function (state, i) {
        const theta =
            theta0 +
            (i % 4) * (Math.PI / 2) +
            (i % 8 > 3 ? 1 : -1) * (i % 16 > 7 ? 3 : 1) * (Math.PI / 16);
        const ecx = r * (i > 15 ? 1.2 : 1) * Math.cos(theta);
        const ecy = -r * (i > 15 ? 1.2 : 1) * Math.sin(theta);
        const electron = group
            .circle(15)
            .attr({ fill: "black", cx: ecx, cy: ecy });
        electron.addClass("draggable");
        //electron.addTo(orbit);
    });
    return group;
}

// FIXME: Retrieves data from model
function drawLewisDotStructure(group, atomicSymbol, r, theta0 = 0) {
    const atomicNumber = elements.get(atomicSymbol);
    const shellGroup = drawShell(
        group,
        valenceShell(take(atomicNumber, electronStates)),
        r,
        theta0
    );
    return drawElementBox(shellGroup, atomicSymbol, r / 2, r / 2);
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

    if (event.dragLeave) {
        target.removeAttribute("data-dropzone");
    }
    // update the posiion attributes
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
}
function dragEndListener(event) {
    var target = event.target;
    var x, y;
    // keep the dragged position in the data-x/data-y attributes
    // translate the element
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

function main() {
    const container = document.getElementById("virginia-content");
    const feedback = document.createElement("div");
    container.appendChild(feedback);
    const scale = 100; // length corresponding to 1 ångström in screen coordinates
    const boundingRect = getBoundingRectXY(xyzData);
    const width = boundingRect.width * scale;
    const height = boundingRect.height * scale;
    const draw = SVG()
        .addTo(container)
        .size(width, height)
        .viewbox(boundingRect);
    xyzData.structure.forEach(function (atom) {
        atomGroup = drawLewisDotStructure(draw.group(), atom.symbol, 1);
        atomGroup.center(atom.x, atom.y); //FIXME: Are these coordinates in user space? If so, we might need to set the svg viewBox
    });
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
            ondrop: function (event) {
                // Remove electron from donating shell
                if (event.target.parentNode.contains(event.relatedTarget))
                    return;
                event.relatedTarget.setAttribute("data-dropzone", event.target);
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
                event.target.parentElement.appendChild(event.relatedTarget);
                feedback.textContent =
                    isFullShell(electrons) && isFullShell(fromElectrons)
                        ? "All shells are full"
                        : "A shell is not full";
            },
        })
        .on("dropactivate", function (event) {
            event.target.classList.add("drop-activated");
        });
}
export { main };
