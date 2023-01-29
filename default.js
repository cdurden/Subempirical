import { getFile } from "./lib/common.js";
import { init } from "./lib/epub/js/epub-loader.js";

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

function dotViewer(file) {
    getFile(file).then(function (response) {
        const comments = [];
        var startCommentPosition, endCommentPosition;
        const commentDelimiters = [
            ["//", "\n"],
            ["/*", "*/"],
        ];
        while (true) {
            [startCommentPosition, endCommentPosition] = commentDelimiters
                .map(function (delimiters) {
                    return matchComment(
                        response.data,
                        endCommentPosition,
                        delimiters
                    );
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
                response.data.slice(startCommentPosition, endCommentPosition)
            );
        }
        console.log(comments);
        d3.select("#virginia-content")
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
            .renderDot(response.data);
    });
}
function txtViewer(file) {
    getFile(file).then(function (response) {
        document.getElementById(
            "virginia-content"
        ).innerHTML = `<pre>${response.data}</pre>`;
    });
}
function markdownViewer(file) {
    getFile(file).then(function (response) {
        var converter = new showdown.Converter({ tables: true }),
            html = converter.makeHtml(response.data);
        document.getElementById("virginia-content").innerHTML = html;
    });
}
function jsonViewer(file, searchParams) {
    const container = document.getElementById("virginia-content");
    getFile(file, {
        transformResponse: (res) => {
            return res;
        },
        responseType: "json",
    }).then(function (response) {
        const moduleUrl = searchParams.get("module");
        if (moduleUrl !== null) {
            import(moduleUrl).then(function (module) {
                const reviver = searchParams.get("reviver") ?? "reviver";
                const object = JSON.parse(response.data, module[reviver]);
                return object.render(container);
            });
        } else {
            console.log(response.data);
            container.innerHTML = `<pre>${JSON.stringify(response.data)}</pre>`;
        }
    });
}
function epubViewer(file, searchParams) {
    const container = document.getElementById("virginia-content");
    getFile("/lib/epub/html/epub-viewer.html").then(function (response) {
        container.innerHTML = response.data;
        init(file, container);
    });
    /*
    var book = ePub(file, { openAs: "epub" });
    var rendition = book.renderTo("virginia-content", {
        method: "continuous",
        width: "100%",
        height: "100%",
    });
    var displayed = rendition.display();
    */
}
function htmlViewer(file, searchParams) {
    const container = document.getElementById("virginia-content");
    getFile(file, {
        transformResponse: (res) => {
            return res;
        },
        responseType: "text/html",
    }).then(function (response) {
        const iframe = document.createElement("iframe");
        iframe.setAttribute(
            "style",
            "width: 100%; height: 100%; border: 0px; padding: 0px;"
        );
        iframe.srcdoc = response.data;
        iframe.src = "data:text/html;charset=utf-8," + escape(response.data);
        container.appendChild(iframe);
    });
    /*
    var book = ePub(file, { openAs: "epub" });
    var rendition = book.renderTo("virginia-content", {
        method: "continuous",
        width: "100%",
        height: "100%",
    });
    var displayed = rendition.display();
    */
}

function handler(file, searchParams) {
    /*
    const handlers = new Map([
        ["dot", dotViewer],
        ["txt", txtViewer],
        ["json", jsonViewer],
    ]);
    const extension = file.split(".").pop();
    handlers.get(extension)(file, searchParams);
    */
    txtViewer(file, searchParams);
}
function main(searchParams) {
    const file = searchParams.get("file");
    const handlers = new Map([
        ["dot", dotViewer],
        ["txt", txtViewer],
        ["json", jsonViewer],
        ["epub", epubViewer],
        ["html", htmlViewer],
        ["md", markdownViewer],
    ]);
    const extension = file.split(".").pop();
    handlers.get(extension)(file, searchParams);
}

export { main, handler, dotViewer, txtViewer, jsonViewer, markdownViewer };
