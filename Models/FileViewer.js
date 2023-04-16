import { any, all, getFile, mapReplacer, loadScript } from "../lib/common.js";
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

function dotViewer(model) {
    const comments = [];
    const rootElement = document.createElement("div");
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
    console.log(comments);
    d3.select(rootElement)
        .graphviz()
        .attributer(function (d) {
            if (d.tag === "#comment") {
                //console.log(d.comment);
                console.log(d);
            }
            if (d.tag === "a") {
                const url = new URL(
                    d.attributes["xlink:href"],
                    window.location.href
                );
                //const url = d.attributes["xlink:href"];
                const searchParams = new URLSearchParams(url.search);
                searchParams.set("redirectUrl", window.location.href);
                url.search = searchParams;
                d3.select(this).attr("href", "yellow");
                d.attributes["xlink:href"] = url;
            }
        })
        .renderDot(model.data);
    return Promise.resolve(rootElement);
}
function txtViewer(model) {
    const rootElement = document.createElement("div");
    rootElement.innerHTML = `<pre>${response.data}</pre>`;
    return Promise.resolve(rootElement);
}
function markdownViewer(model) {
    const rootElement = document.createElement("div");
    var converter = new showdown.Converter({ tables: true }),
        html = converter.makeHtml(model.data);
    rootElement.innerHTML = html;
    return Promise.resolve(rootElement);
}
function jsonLoader(url, paramsMap) {
    getFile(url, {
        transformResponse: (res) => {
            return res;
        },
        responseType: "json",
    }).then(function (response) {
        const moduleUrl = paramsMap.get("module");
        if (moduleUrl !== null) {
            return import(moduleUrl).then(function (module) {
                const reviver = paramsMap.get("reviver") ?? "reviver";
                const data = JSON.parse(response.data, module[reviver]);
                return { data };
            });
        } else {
            return response;
        }
    });
}
function jsonViewer(model) {
    const rootElement = document.createElement("div");
    container.innerHTML = `<pre>${JSON.stringify(model.data)}</pre>`;
    return Promise.resolve(rootElement);
}
function failureViewer(model) {
    const rootElement = document.createElement("div");
    container.innerHTML = `<pre>${JSON.stringify(model.data)}</pre>`;
    return Promise.resolve(rootElement);
}
function epubViewer(model) {
    const rootElement = document.createElement("div");
    getFile("/lib/epub/html/epub-viewer.html").then(function (response) {
        container.innerHTML = response.data;
        epubInit(model.url, container);
        return Promise.resolve(rootElement);
    });
}
function htmlViewer(file, paramsMap) {
    const rootElement = document.createElement("div");
    const iframe = document.createElement("iframe");
    iframe.setAttribute(
        "style",
        "width: 100%; height: 100%; border: 0px; padding: 0px;"
    );
    iframe.srcdoc = model.data;
    iframe.src = "data:text/html;charset=utf-8," + escape(model.data);
    rootElement.appendChild(iframe);
    return Promise.resolve(rootElement);
}

function View(update) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, View.prototype);
    //const rootElement = document.createElement("div");
    function render(model) {
        return new Promise(function (resolve) {
            const viewerMap = new Map([
                ["dot", dotViewer],
                ["txt", txtViewer],
                ["json", jsonViewer],
                ["epub", epubViewer],
                ["html", htmlViewer],
                ["md", markdownViewer],
            ]);
            (viewerMap.get(model.extension) ?? failureViewer)(model).then(
                function (rootElement) {
                    self.rootElement = rootElement;
                    resolve(self);
                }
            );
        });
    }
    return Object.assign(self, {
        //rootElement,
        render,
    });
}
function makeUpdateFunction(model, callback) {
    return function update(message, view) {
        if (message.action === "createPolypad") {
            model.polypadInstance = message.polypadInstance;
        } else if (message.action === "change") {
            model.data.polypadData = model.polypadInstance.serialize();
        }
        //view.render(model);
        callback(message, model);
        return true;
    };
}

function Model(paramsMap) {
    const self = Object.create(null);
    Object.setPrototypeOf(self, Model.prototype);
    const loaders = new Map([["json", jsonLoader]]);
    const fileUrl = paramsMap.get("file");
    const extension = fileUrl.split(".").pop();
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
    return (loaders.get(extension) ?? getFile)(fileUrl).then(function (
        response
    ) {
        Object.assign(self, {
            url: fileUrl,
            data: response.data,
            extension,
            exportModel,
            //update,
        });
        return self;
    });
}
function init(paramsMap, postUpdateCallback = function () {}) {
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
            const update = makeUpdateFunction(model, postUpdateCallback);
            const view = new View(update);
            view.render(model);
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
