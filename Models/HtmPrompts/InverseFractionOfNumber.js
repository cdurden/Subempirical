export function render(h, { a, b, m, n }) {
    const inverse =
        Number(a) === 1 ? `${b} times` : `\$ \\frac{${b}}{${a}} \$ of`;
    return h("div", {}, [
        h(
            "p",
            { style: "margin-bottom: 3.5cm" },
            `Step 1: Find \$ \\frac{${a}}{${b}} \$ of \$ ${n} \$.`
        ),
        h(
            "p",
            { style: "margin-bottom: 3.5cm" },
            `Step 2: Find ${inverse} your answer to step 1.`
        ),
        h(
            "p",
            { style: "margin-bottom: 1cm" },
            `Question: What is the inverse of finding \$ \\frac{${a}}{${b}} \$ of a number?`
        ),
    ]);
}
