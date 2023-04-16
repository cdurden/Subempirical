/* This is a work in progress */
function View(model, update) {
    const self = Object.create(null);
    const show = false;
    //var rootElement = document.createElement("div");
    const messageBackdropElmt = document.createElement("div");
    Object.setPrototypeOf(self, View.prototype);
    function render() {
        const keyboardHandler = function (event) {
            if (event.key === "Escape") {
                update({ action: "hide" });
                //self.show = false;
            } else if (event.key === "Enter") {
                update({ message: "submit" });
                model.data.messageSpec.onSubmit(model);
                //self.show = false;
                update({ action: "show" });
            }
        };
        if (self.show) {
            messageBackdropElmt.style.visibility = "visible";
        } else {
            messageBackdropElmt.style.visibility = "hidden";
            document.removeEventListener("keydown", keyboardHandler);
        }

        return new Promise(function (resolve) {
            messageBackdropElmt.replaceChildren();
            const messageElmt = document.createElement("div");
            //messageElmt.replaceWith();
            messageElmt.className = model.data.messageSpec.className;
            messageBackdropElmt.appendChild(messageElmt);
            const messageHeaderElmt = document.createElement("div");
            messageHeaderElmt.textContent = model.data.messageSpec.header;
            messageElmt.appendChild(messageHeaderElmt);
            const messageBodyElmt = document.createElement("div");
            if (model.isModal) {
                messageBackdropElmt.classList.add("modal-backdrop");
                messageHeaderElmt.classList.add("modal-header");
                messageBodyElmt.classList.add("modal-body");
            }
            messageBodyElmt.innerHTML = model.data.messageSpec.body;
            messageElmt.appendChild(messageBodyElmt);
            const focusable = messageBodyElmt.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length > 0) {
                focusable[0].focus();
                focusable[0].select();
            }
            model.data.messageSpec.buttons.forEach(function (buttonSpec) {
                const messageButtonElmt = document.createElement("button");
                messageButtonElmt.textContent = buttonSpec.textContent;
                messageBodyElmt.appendChild(messageButtonElmt);
                messageButtonElmt.addEventListener("click", function () {
                    buttonSpec.onClick(model);
                });
            });
            /*
            const messageCancelButtonElmt = document.createElement("button");
            messageCancelButtonElmt.textContent = "Cancel";
            messageBodyElmt.appendChild(messageCancelButtonElmt);
            messageOkButtonElmt.addEventListener("click", function () {
                model.data.messageSpec.onSubmit(model);
            });
            messageCancelButtonElmt.addEventListener("click", function () {
                //self.show = false;
                update({ action: "hide" });
            });
            */
            document.addEventListener("keydown", keyboardHandler);
        });
    }
    return Object.assign(self, {
        rootElement: messageBackdropElmt,
        render,
        show,
    });
}

function Model(paramsMap) {
    const self = Object.create(null);
    const data = { messageSpec: undefined };
    Object.setPrototypeOf(self, Model.prototype);
    function setModalSpec(messageSpec) {
        data.messageSpec = messageSpec;
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
                    model.setModalSpec(message.messageSpec);
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
