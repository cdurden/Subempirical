var readyEvent = new Event("DOMContentLoadedAndMathJaxReady");
function setup(mathJaxQueue, state) {
    window.MathJax = {
        loader: {
            load: [
                "output/svg",
                "[tex]/bbox",
                "[tex]/color",
                "[tex]/textmacros",
                "[custom]/htmlset.min.js",
                //"[img]/img.min.js",
            ],
            paths: {
                custom: "./lib/htmlset-extension",
                //img: "https://cdn.jsdelivr.net/npm/mathjax-img@3",
            },
        },
        tex: {
            packages: {
                //"[+]": ["color", "bbox", "textmacros", "htmlset", "img"],
                "[+]": ["color", "bbox", "textmacros", "htmlset"],
            },
            inlineMath: [
                ["$", "$"],
                ["\\(", "\\)"],
            ],
            macros: {
                omspace: [
                    "{\\setAttribute{data-space-id}{#2}{\\class{dropzone}{#1}}}",
                    2,
                    "\\fbox{\\color{white} 0}",
                ],
                omtile: [
                    "{\\setAttribute{data-value}{#1}{\\class{draggable}{\\bbox[10px,white,border: 5px solid black]{#1}}}}",
                    1,
                ],
            },
        },
        startup: {
            pageReady() {
                return MathJax.startup
                    .defaultPageReady()
                    .then(function (pageReadyPromise) {
                        mathJaxQueue.forEach(function (action) {
                            action();
                        });
                        state.ready = true;
                        /*
                    if (document.readyState === "loading") {
                        // Loading hasn't finished yet
                        document.addEventListener(
                            "DOMContentLoaded",
                            document.dispatchEvent(readyEvent)
                        );
                        window.mathJaxReady = true;
                    } else {
                        // `DOMContentLoaded` has already fired
                        document.dispatchEvent(readyEvent);
                        window.mathJaxReady = true;
                    }
                    return pageReadyPromise;
                    */
                    });
            },
        },
    };
}

export { setup };
