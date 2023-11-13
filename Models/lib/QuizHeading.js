import { dom } from "../../lib/common.js";

function View(model, update) {
    function myDom() {
        /*
    const headingElmt = document.createElement("div");
    const nameElmt = document.createElement("div");
    const titleElmt = document.createElement("div");
    headingElmt.style.setProperty("font-size", "16pt");
    nameElmt.style.setProperty("float", "right");
    nameElmt.textContent = "Name: ___________________________";
    titleElmt.textContent = "Quiz 9-5";
    headingElmt.appendChild(nameElmt);
    headingElmt.appendChild(titleElmt);
    */
        const headingDom = dom("div", {});
        return headingDom;
    }
    return { dom: myDom };
}

export { View };
