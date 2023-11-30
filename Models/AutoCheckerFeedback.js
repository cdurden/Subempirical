import { all, loadScript, dom } from "../lib/common.js";
import * as FeedbackMessage from "./lib/FeedbackMessage.js";

function Model(paramsMap) {
    const self = Object.create(null);
    return Object.assign(self, { correct: false });
}
function init(paramsMap, updateParentServices) {
    const updateParent = updateParentServices.get("parent");
    const model = Model(paramsMap);
    model.history = [];
    const view = new FeedbackMessage.View(model, update);
    function update(message) {
        if (message.action === "getFeedback") {
            model.correct = message.model.check(message.model, message.data);
            model.history.push(model.correct);
            view.setVisible(true);
            view.render();
            message.update({
                action: "sendFeedback",
                model: message.model,
                feedbackModel: model,
            });
            message.update({
                ...message.submitMessage,
                correct: model.correct,
            });
        }
    }
    return Promise.resolve({ model, view, update });
}

export { init };
