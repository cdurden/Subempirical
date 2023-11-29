function randInt(rand, { min, max }) {
    return Math.floor(rand() * (max - (min ?? 0))) + (min ?? 0);
}

function randPrompt(rand, { a, b, xunit, yunit, person, food, gender }) {
    const prompts = [
        {
            situation: `${person ?? "Kobe"} has a recipe for ${
                food ?? "cake"
            } which uses ${a} ${xunit ?? "cups"} and ${b} ${
                yunit ?? "cups"
            } for one batch.`,
            detail: `To make different amounts of ${food ?? "cake"}, ${
                gender !== "female" ? "he" : "she"
            } uses different amounts of the ingredients but he keeps their ratio the same.`,
        },
        {
            situation: `The strength of the incredible Hulk is proportional to his level of rage. He can lift ${b} tons when his rage level is ${a}.`,
            xlab: "rage level",
            ylab: "lifting strength",
            yunit: "tons",
            xunit: "",
        },
        {
            situation: `When Giant-Man is ${a} feet tall he is able to lift ${b} tons. As his size increases, his strength increases proportionally.`,
            yunit: "tons",
            xunit: "feet",
            xlab: "height",
            ylab: "lifting strength",
        },
        {
            situation: `If Rogue touches someone for ${a} seconds, she absorbs ${b} percent of their power.`,
            yunit: "%",
            xunit: "seconds",
            xlab: "contact time",
            ylab: "power absorbed",
        },
        {
            situation: `The Flash's speed is proportional to the vibrational frequency of the molecules in his body. By vibrating his molecules at ${a} terahertz, he can move ${b} miles per hour.`,
            yunit: "miles per hour",
            xunit: "terahertz",
            xlab: "frequency",
            ylab: "speed",
        },
        {
            situation: `A student can read ${a} pages in ${b} minutes.`,
            yunit: "",
            xunit: "minutes",
            xlab: "pages read",
            ylab: "time",
        },
        {
            situation: `A runner can run ${a} miles in ${b} minutes.`,
            yunit: "miles",
            xunit: "minutes",
            xlab: "distance",
            ylab: "time",
        },
        {
            situation: `A bicyclist burns ${a} calories every ${b} minutes, while cycling`,
            xunit: "minutes",
            yunit: "calories",
            xlab: "time",
            ylab: "energy burned",
        },
        {
            situation: `A car can travel ${a} miles on ${b} gallons of gasoline`,
            xunit: "gallons",
            yunit: "miles",
            xlab: "gas",
            ylab: "distance",
        },
    ];
    return prompts[randInt(rand, { min: 0, max: prompts.length - 1 })];
}

export { randPrompt };
