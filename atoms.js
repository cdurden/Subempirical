const elements = new Map([
    [1, "H"],
    [2, "He"],
    [3, "Li"],
    [4, "Be"],
    [5, "B"],
    [6, "C"],
    [7, "N"],
    [8, "O"],
    [9, "F"],
    [10, "Ne"],
    [11, "Na"],
    [12, "Mg"],
    [13, "Al"],
    [14, "Si"],
    [15, "P"],
    [16, "S"],
    [17, "Cl"],
    [18, "Ar"],
    [19, "K"],
    [20, "Ca"],
    [21, "Sc"],
    [22, "Ti"],
    [23, "V"],
    [24, "Cr"],
    [25, "Mn"],
    [26, "Fe"],
    [27, "Co"],
    [28, "Ni"],
    [29, "Cu"],
    [30, "Zn"],
    [31, "Ga"],
    [32, "Ge"],
    [33, "As"],
    [34, "Se"],
    [35, "Br"],
    [36, "Kr"],
    [37, "Rb"],
    [38, "Sr"],
    [39, "Y"],
    [40, "Zr"],
    [41, "Nb"],
    [42, "Mo"],
    [43, "Tc"],
    [44, "Ru"],
    [45, "Rh"],
    [46, "Pd"],
    [47, "Ag"],
    [48, "Cd"],
    [49, "In"],
    [50, "Sn"],
    [51, "Sb"],
    [52, "Te"],
    [53, "I"],
    [54, "Xe"],
    [55, "Cs"],
    [56, "Ba"],
    [57, "La"],
    [58, "Ce"],
    [59, "Pr"],
    [60, "Nd"],
    [61, "Pm"],
    [62, "Sm"],
    [63, "Eu"],
    [64, "Gd"],
    [65, "Tb"],
    [66, "Dy"],
    [67, "Ho"],
    [68, "Er"],
    [69, "Tm"],
    [70, "Yb"],
    [71, "Lu"],
    [72, "Hf"],
    [73, "Ta"],
    [74, "W"],
    [75, "Re"],
    [76, "Os"],
    [77, "Ir"],
    [78, "Pt"],
    [79, "Au"],
    [80, "Hg"],
    [81, "Tl"],
    [82, "Pb"],
    [83, "Bi"],
    [84, "Po"],
    [85, "At"],
    [86, "Rn"],
    [87, "Fr"],
    [88, "Ra"],
    [89, "Ac"],
    [90, "Th"],
    [91, "Pa"],
    [92, "U"],
    [93, "Np"],
    [94, "Pu"],
    [95, "Am"],
    [96, "Cm"],
    [97, "Bk"],
    [98, "Cf"],
    [99, "Es"],
    [100, "Fm"],
    [101, "Md"],
    [102, "No"],
    [103, "Lr"],
    [104, "Rf"],
    [105, "Db"],
    [106, "Sg"],
    [107, "Bh"],
    [108, "Hs"],
    [109, "Mt"],
    [110, "Ds"],
    [111, "Rg"],
    [112, "Uub"],
    [114, "Uuq"],
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
function drawElementBox(group, atomicNumber, w, h) {
    const atomicSymbol = elements.get(atomicNumber);
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
function drawLewisDotStructure(group, atomicNumber, r, theta0 = 0) {
    const shellGroup = drawShell(
        group,
        valenceShell(take(atomicNumber, electronStates)),
        r,
        theta0
    );
    return drawElementBox(shellGroup, atomicNumber, r / 2, r / 2);
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
    var draw = SVG().addTo(container).size(600, 300);
    container.appendChild(feedback);
    const hydrogen = drawLewisDotStructure(draw.group(), 1, 100);
    hydrogen.center(150, 150);
    const flourine = drawLewisDotStructure(draw.group(), 9, 100, -Math.PI / 2);
    flourine.center(450, 150);
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
