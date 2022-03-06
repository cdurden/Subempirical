document.addEventListener("DOMContentLoadedAndMathJaxReady", function () {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(window.location.search);
    const moduleUrl = searchParams.get("module") ?? "./default.js";
    import(moduleUrl).then(function (module) {
        module["main"](searchParams);
    });
});
