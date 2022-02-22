/*
document.addEventListener("DOMContentLoaded", function () {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(window.location.search);
    const file = searchParams.get("file");
    if (searchParams.has("file")) {
        const moduleUrl = searchParams.get("module") ?? "./default.js";
        import(moduleUrl).then(function (module) {
            const handler = searchParams.get("handler") ?? "handler";
            module[handler](file, searchParams);
        });
    }
});
*/
document.addEventListener("DOMContentLoaded", function () {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(window.location.search);
    const moduleUrl = searchParams.get("module") ?? "./default.js";
    import(moduleUrl).then(function (module) {
        module["main"]();
    });
});
