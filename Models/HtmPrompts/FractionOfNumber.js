function generatePrompt(html, { a, b, m, n }) {
    return html(`Find \$ \\frac{${a}}{${b}} \$ of \$ ${n} \$`);
}

export { generatePrompt, generateFeedback };
