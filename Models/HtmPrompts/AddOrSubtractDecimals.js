export function render(html, { n1, sign1, n2, sign2, subtract }) {
    return html(
        `Find \$ ${sign1 ?? ""} ${n1} ${subtract ? "-" : "+"} ${
            sign2 ?? ""
        } ${n2}\$`
    );
}
