function randInt(rand, { min, max }) {
    return Math.floor(rand() * (max - (min ?? 0))) + (min ?? 0);
}

function randPrompt(rand, params) {
    const {
        a,
        b,
        xunit,
        yunit,
        x,
        y,
        xlab,
        ylab,
        person,
        food,
        gender,
    } = params;
    const paramSets = [
        {
            situation: `${person ?? "Kobe"} has a recipe for ${
                food ?? "cake"
            } which uses ${x[0]} ${xunit ?? "cups"} ${xlab} and ${y[0]} ${
                yunit ?? "cups"
            } ${ylab} for one batch.`,
            detail: `To make different amounts of ${food ?? "cake"}, ${
                gender !== "female" ? "he" : "she"
            } uses different amounts of the ingredients but he keeps their ratio the same.`,
        },
        {
            situation: `The strength of the incredible Hulk is proportional to his level of rage. He can lift ${y[0]} tons when his rage level is ${x[0]}.`,
            xlab: "rage level",
            ylab: "lifting strength",
            yunit: "tons",
            xunit: "",
        },
        {
            situation: `When Giant-Man is ${x[0]} feet tall he is able to lift ${y[0]} tons. As his size increases, his strength increases proportionally.`,
            yunit: "tons",
            xunit: "feet",
            xlab: "height",
            ylab: "lifting strength",
        },
        {
            situation: `If Rogue touches someone for ${x[0]} seconds, she absorbs ${y[0]} percent of their power.`,
            yunit: "%",
            xunit: "seconds",
            xlab: "contact time",
            ylab: "power absorbed",
        },
        {
            situation: `The Flash's speed is proportional to the vibrational frequency of the molecules in his body. By vibrating his molecules at ${x[0]} terahertz, he can move ${y[0]} miles per hour.`,
            yunit: "miles per hour",
            xunit: "terahertz",
            xlab: "frequency",
            ylab: "speed",
        },
        {
            situation: `A student can read ${x[0]} pages in ${y[0]} minutes.`,
            yunit: "",
            xunit: "minutes",
            xlab: "pages read",
            ylab: "time",
        },
        {
            situation: `A runner can run ${x[0]} miles in ${y[0]} minutes.`,
            yunit: "miles",
            xunit: "minutes",
            xlab: "distance",
            ylab: "time",
        },
        {
            situation: `A bicyclist burns ${x[0]} calories every ${y[0]} minutes, while cycling`,
            xunit: "minutes",
            yunit: "calories",
            xlab: "time",
            ylab: "energy burned",
        },
        {
            situation: `A car can travel ${x[0]} miles on ${y[0]} gallons of gasoline`,
            xunit: "gallons",
            yunit: "miles",
            xlab: "gas",
            ylab: "distance",
        },
    ];
    const paramSet =
        paramSets[randInt(rand, { min: 0, max: paramSets.length - 1 })];
    const xvar = paramSet.xlab?.[0] ?? "x";
    const yvar = paramSet.ylab?.[0] ?? "y";
    return {
        xvar,
        yvar,
        ...paramSet,
    };
}

export { randPrompt };
