import { any, all, getFile, mapReplacer, loadScript, joinPath } from "../lib/common.js";
import { init as epubInit } from "../lib/epub/js/epub-loader.js";

function matchComment(str, index, delimiters) {
    const [startingDelim, endingDelim] = delimiters;
    const comment = null;
    const startPosition = str.indexOf(startingDelim, index);
    var endPosition = -1;
    if (startPosition !== -1) {
        endPosition = str.indexOf(endingDelim, startPosition);
        return [
            startPosition + startingDelim.length,
            endPosition - endingDelim.length,
        ];
    }
    return [-1, -1];
}

function closest(elmt, testFunction) {
    if (!elmt.parent) {
        return undefined;
    } else if (testFunction(elmt.parent)) {
        return elmt.parent;
    } else {
        return closest(elmt.parent, testFunction);
    }
}
function extractComments(model) {
    const comments = [];
    var startCommentPosition, endCommentPosition;
    const commentDelimiters = [
        ["//", "\n"],
        ["/*", "*/"],
    ];
    while (true) {
        [startCommentPosition, endCommentPosition] = commentDelimiters
            .map(function (delimiters) {
                return matchComment(model.data, endCommentPosition, delimiters);
            })
            .reduce(function ([start, end], [thisStart, thisEnd]) {
                if (thisStart !== -1 && thisStart < start) {
                    return [thisStart, thisEnd];
                } else {
                    return [start, end];
                }
            });
        if (startCommentPosition === -1) {
            break;
        }
        comments.push(
            model.data.slice(startCommentPosition, endCommentPosition)
        );
    }
    return comments;
}

function dotViewer(model, rootElement) {
    return d3
        .select(rootElement)
        .graphviz()
        .attributer(function (d) {
            if (d.tag === "#comment") {
                //console.log(d.comment);
                console.log(d);
            }
            if (d.tag === "a") {
                const node = closest(d, function (elmt) {
                    return elmt.attributes.class === "node";
                });
                const url = new URL(
                    `?taskPath=${node.key}`,
                    window.location.href
                );
                const searchParams = new URLSearchParams(url.search);
                searchParams.set("redirectUrl", window.location.href);
                url.search = searchParams;
                d3.select(this).attr("href", "yellow");
                d.attributes["xlink:href"] = url;
            }
            if (d.tag === "path") {
                const node = closest(d, function (elmt) {
                    return elmt.attributes.class === "node";
                });
                if (model.completedTasks.includes(node?.key)) {
                    d.attributes["fill"] = "green";
                    d3.select(this).attr("fill", "green");
                }
            }
        })
        .renderDot(model.data);

    return Promise.resolve(rootElement);
}

function View(model, update) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    const rootElement = document.createElement("div");
    function render() {
        return new Promise(function (resolve) {
            function eqSet(xs, ys) {
                return xs.size === ys.size && [...xs].every((x) => ys.has(x));
            }
            function setNodes() {
                const originalNodes = model.nodes;
                const newNodes = [];
                d3.selectAll(".node").each(function (node) {
                    newNodes.push(node.key);
                });
                model.setNodes(newNodes);
                if (!eqSet(new Set(originalNodes), new Set(newNodes))) {
                    update({ action: "nodeChange" });
                }
                resolve();
            }
            dotViewer(model, rootElement).on("end", setNodes);
        });
    }
    return Object.assign(self, {
        rootElement,
        render,
    });
}

function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const graphUrl = paramsMap.get("graphUrl");
    const completedTasks = [];
    const extension = graphUrl.split(".").pop();
    function setNodes(nodes) {
        Object.assign(self, {
            nodes,
        });
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
    return getFile(graphUrl).then(function (response) {
        Object.assign(self, {
            graphUrl: graphUrl,
            data: response.data,
            extension,
            exportModel,
            completedTasks,
            nodes: [],
            setNodes,
            //update,
        });
        return self;
    });
}
function init(paramsMap, updateParent) {
    const scriptSourceMap = new Map([
        ["localhost", ["https://static.mathigon.org/api/polypad-en-v4.5.4.js"]],
        ["other", ["https://static.mathigon.org/api/polypad-en-v4.5.4.js"]],
    ]);
    const hostname = window.location.hostname;
    const scriptSource = scriptSourceMap.has(hostname) ? hostname : "other";
    return Promise.all(
        scriptSourceMap.get(scriptSource).map(function (script) {
            return loadScript(script);
        })
    ).then(function (modules) {
        return new Model(paramsMap).then(function (model) {
            const view = new View(model, update);
            function update(message) {
                if (message.action === "createPolypad") {
                    model.polypadInstance = message.polypadInstance;
                } else if (message.action === "change") {
                    model.data.polypadData = model.polypadInstance.serialize();
                } else if (message.action === "loadSubmissions") {
                    message.submissions.forEach(function (submission) {
                        if (!model.completedTasks.includes(submission[3])) {
                            model.completedTasks.push(submission[3]);
                        }
                    });
                    view.render();
                } else if (message.action === "nodeChange") {
                    model.nodes.forEach(function (node) {
                        updateParent({
                            action: "getSubmissions",
                            model,
                            update,
                            taskPath: joinPath(baseTaskPath, node),
                        });
                    });
                }
                return updateParent(message).then(function (message) {
                    return message;
                });
                //view.render(model);
                //callback(message, model);
                //return Promise.resolve(message);
            }
            //view.render(model);
            return { model, view, update };
        });
    });
}

function main(paramsMap, onUpdate) {
    const container = document.getElementById("virginia-content");
    init(paramsMap).then(function (mvu) {
        mvu.view.render(mvu.model).then(function (view) {
            container.appendChild(view.rootElement);
            const exportModelLink = document.createElement("a");
            exportModelLink.textContent = "Export";
            exportModelLink.addEventListener("click", mvu.model.exportModel);
            container.appendChild(exportModelLink);
        });
    });
}
export { init, main, Model };
