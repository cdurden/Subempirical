export function render(h, { n1, sign1, n2, sign2, subtract }) {
    return h("div", {}, [
        h(
            "p",
            { style: "height: 6cm" },
            `Step 1: Use a number line to find \$ ${sign1 ?? ""} ${n1} ${
                subtract ? "-" : "+"
            } ${sign2 ?? ""} ${n2}\$`
        ),
        h(
            "p",
            { style: "height: 1.5cm" },
            `Step 2: On your number line, draw an arrow back to \$ ${
                sign1 ?? ""
            } ${n1} \$.`
        ),
        h(
            "p",
            { style: "margin-bottom: 1.5cm" },
            `Question: What is the inverse of ${
                subtract ? "subtracting" : "adding"
            } \$ ${sign2 ?? ""} ${n2}\$?`
        ),
    ]);
}
