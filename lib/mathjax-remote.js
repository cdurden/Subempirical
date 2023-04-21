var readyEvent = new Event("DOMContentLoadedAndMathJaxReady");
window.mathJaxReady = false;
MathJax = {
    loader: {
        load: [
            "output/chtml",
            "[tex]/bbox",
            "[tex]/color",
            "[tex]/textmacros",
            "[custom]/htmlset.min.js",
            //"[img]/img.min.js",
        ],
        paths: {
            custom:
                "https://cdn.jsdelivr.net/gh/cdurden/Subempirical@b85ef26f4f79c701ae76afaf09553d41d8b95df4/lib/htmlset-extension",
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
                "{\\setAttribute{data-space-id}{#2}{\\class{openMiddleSpace}{#1}}}",
                2,
                "\\fbox{\\color{white} 0}",
            ],
            omtile: [
                "{\\setAttribute{data-value}{#1}{\\class{openMiddleTile}{\\bbox[10px,white,border: 5px solid black]{#1}}}}",
                1,
            ],
        },
    },
    startup: {
        pageReady() {
            return MathJax.startup.defaultPageReady().then(function () {
                if (document.readyState === "loading") {
                    // Loading hasn't finished yet
                    document.addEventListener("DOMContentLoaded", function () {
                        document.dispatchEvent(readyEvent);
                        window.mathJaxReady = true;
                    });
                } else {
                    // `DOMContentLoaded` has already fired
                    document.dispatchEvent(readyEvent);
                    window.mathJaxReady = true;
                }
            });
        },
    },
};
