import { all, loadScript, dom } from "../lib/common.js";
import * as FeedbackMessage from "./lib/FeedbackMessage.js";

function Model(paramsMap) {
    const self = Object.create(null);
    return Object.assign(self, { correct: false });
}
function init(paramsMap, updateParent) {
    const model = Model(paramsMap);
    const view = new FeedbackMessage.View(model, update);
    function update(message) {
        if (message.action === "addChild") {
            view.addChild(message.child);
        }
        if (message.action === "getFeedback") {
            model.correct = message.model.check(message.model, message.data);
            view.setVisible(true);
            updateParent({ action: "renderTask" });
            updateParent({
                action: "postFeedback",
                correct: model.correct,
                submitMessage: message.submitMessage,
            });
        }
        updateParent(message);
    }
    return Promise.resolve({ model, view, update });
}

export { init };
