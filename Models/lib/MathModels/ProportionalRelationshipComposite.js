import * as MathField from "../MathField.js";
import * as SubmitButton from "../SubmitButton.js";
import * as FeedbackMessage from "../FeedbackMessage.js";
import { init as initFeedback } from "../../AutoCheckerFeedback.js";
import * as HtmlTapeDiagram from "../../HtmlTapeDiagram.js";
import { dom, zip, loadStylesheet } from "../../../lib/common.js";
import * as ProportionalRelationshipTable from "./ProportionalRelationshipTable.js";
import * as WriteEquationOfProportionalRelationship from "./WriteEquationOfProportionalRelationship.js";
import * as DoubleNumberLine from "./DoubleNumberLine.js";

function prompt(model, { abbreviate }) {
    const {
        a,
        b,
        x,
        y,
        xlab,
        xunit,
        ylab,
        yunit,
        situation,
        conjunction,
        condition,
        person,
        gender,
        food,
    } = model.params;
    const recipe = `${person ?? "Kobe"} has a recipe for ${
        food ?? "cake"
    } which uses`;
    const detail = `To make different amounts of ${food ?? "cake"}, ${
        gender !== "female" ? "he" : "she"
    } uses different amounts of the ingredients but he keeps their ratio the same.`;
    return `${model.label}. ${situation ?? recipe} $${
        model.ce.parse(`${y[0]}`).latex
    }$ ${yunit ?? "cups"} ${ylab} ${conjunction ?? "and"} $${
        model.ce.parse(`${x[0]}`).latex
    }$ ${xunit ?? "cups"} ${xlab} ${condition ?? "for one batch"}. ${detail}`;
}

function inputDom(model, updateParent, children) {
    const { a, b, x, y, xlab, ylab } = model.params;
    initFeedback(model.paramsMap, updateParent).then(function (feedbackMVU) {
        children.set("feedback", feedbackMVU);
    });
    function update(message) {
        if (message.action === "submit") {
            children.get("feedback").update({
                action: "getFeedback",
                submitMessage: message,
                data: message.data,
                model: message.model,
            });
            updateParent(message);
            //children.get("feedback").update(message);
        }
    }
    return dom("div", {}, [
        dom("div", { style: "display: flex;" }, [
            dom("div", {}, [
                "a. ",
                ProportionalRelationshipTable.prompt(model, {
                    abbreviate: true,
                }),
                ProportionalRelationshipTable.inputDom(model, updateParent),
            ]),
            dom("div", {}, [
                dom("div", { style: "margin-bottom: 6em;" }, [
                    "b. ",
                    WriteEquationOfProportionalRelationship.prompt(model, {
                        abbreviate: true,
                    }),
                    WriteEquationOfProportionalRelationship.inputDom(
                        model,
                        updateParent
                    ),
                ]),
                /*
                dom("div", {}, [
                    "b. ",
                    DoubleNumberLine.prompt(model, { abbreviate: true }),
                ]),
                */
            ]),
            //dom("div", {}, [children.get("feedback")?.view?.dom()]),
        ]),
        /*
        new FeedbackMessage.View(model, updateParent).dom(
            children.get("feedback")
        ),
        */
        dom("div", { class: "feedback-container" }, [
            children.get("feedback")?.view?.dom(),
        ]),
        ...(model.paramsMap.get("printMode")
            ? []
            : [new SubmitButton.View(model, update).dom()]),
    ]);
}

function check(model) {
    return (
        WriteEquationOfProportionalRelationship.check(model) &&
        ProportionalRelationshipTable.check(model)
    );
}

export { prompt, check, inputDom };
