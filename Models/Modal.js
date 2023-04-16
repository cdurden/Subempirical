/* This is a work in progress */
function View(model, update) {
    const self = Object.create(null);
    const show = false;
    //var rootElement = document.createElement("div");
    const modalBackdropElmt = document.createElement("div");
    Object.setPrototypeOf(self, View.prototype);
    function render() {
        const keyboardHandler = function (event) {
            if (event.key === "Escape") {
                update({ action: "hide" });
                //self.show = false;
            } else if (event.key === "Enter") {
                update({ message: "submit" });
                model.data.modalSpec.onSubmit(model);
                //self.show = false;
                update({ action: "show" });
            }
        };
        if (self.show) {
            modalBackdropElmt.style.display = "block";
        } else {
            modalBackdropElmt.style.display = "none";
            document.removeEventListener("keydown", keyboardHandler);
        }

        return new Promise(function (resolve) {
            modalBackdropElmt.replaceChildren();
            //self.show = true;
            //update({ action: "show" });
            //modalBackdropElmt = document.createElement("div");
            //rootElement.appendChild(modalBackdropElmt);
            modalBackdropElmt.classList.add("modal-backdrop");
            const modalElmt = document.createElement("div");
            //modalElmt.replaceWith();
            modalElmt.classList.add("modal");
            modalBackdropElmt.appendChild(modalElmt);
            const modalHeaderElmt = document.createElement("div");
            modalHeaderElmt.classList.add("modal-header");
            modalHeaderElmt.textContent = model.data.modalSpec.header;
            modalElmt.appendChild(modalHeaderElmt);
            const modalBodyElmt = document.createElement("div");
            modalBodyElmt.classList.add("modal-body");
            modalBodyElmt.innerHTML = model.data.modalSpec.body;
            modalElmt.appendChild(modalBodyElmt);
            const focusable = modalBodyElmt.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length > 0) {
                focusable[0].focus();
                focusable[0].select();
            }
            const modalOkButtonElmt = document.createElement("button");
            modalOkButtonElmt.textContent = "OK";
            modalBodyElmt.appendChild(modalOkButtonElmt);
            const modalCancelButtonElmt = document.createElement("button");
            modalCancelButtonElmt.textContent = "Cancel";
            modalBodyElmt.appendChild(modalCancelButtonElmt);
            modalOkButtonElmt.addEventListener("click", function () {
                model.data.modalSpec.onSubmit(model);
            });
            modalCancelButtonElmt.addEventListener("click", function () {
                //self.show = false;
                update({ action: "hide" });
            });
            document.addEventListener("keydown", keyboardHandler);
        });
    }
    return Object.assign(self, {
        rootElement: modalBackdropElmt,
        render,
        show,
    });
}

function Model(paramsMap) {
    const self = Object.create(null);
    const data = { modalSpec: undefined };
    Object.setPrototypeOf(self, Model.prototype);
    function setModalSpec(modalSpec) {
        data.modalSpec = modalSpec;
    }
    return new Promise(function (resolve) {
        resolve(
            Object.assign(self, {
                data,
                setModalSpec,
            })
        );
    });
}

function init(paramsMap, updateParent) {
    const scriptSourceMap = new Map([]);
    const hostname = window.location.hostname;
    const scriptSource = scriptSourceMap.has(hostname) ? hostname : "other";
    return Promise.all(
        (scriptSourceMap.get(scriptSource) ?? []).map(function (script) {
            return loadScript(script);
        })
    ).then(function () {
        return new Model(paramsMap).then(function (model) {
            function update(message) {
                if (message.action === "updateModal") {
                    model.setModalSpec(message.modalSpec);
                    view.render();
                } else if (message.action === "show") {
                    view.show = true;
                    view.render();
                } else if (message.action === "hide") {
                    view.show = false;
                    view.render();
                }
                updateParent(message);
                return Promise.resolve(message);
            }

            const view = new View(model, update);
            return {
                model,
                view,
                update,
            };
        });
    });
}

export { init };
