import { all, loadScript, dom } from "../lib/common.js";
import * as FeedbackMessage from "./lib/FeedbackMessage.js";

function init(paramsMap, updateParentServices) {
    function update(message) {
        if (message.action === "getFeedback") {
            model.correct = message.model.check(message.model, message.data);
            model.history.push(model.correct);
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
