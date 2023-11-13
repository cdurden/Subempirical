export function render(html, { n1, d1, sign1, n2, d2, sign2, subtract }) {
    return html(
        `Find \$ ${sign1 ?? ""} \\frac{${n1}}{${d1}} ${subtract ? "-" : "+"} ${
            sign2 ?? ""
        } \\frac{${n2}}{${d2}}\$`
    );
}
