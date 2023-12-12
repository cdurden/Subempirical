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
            situation: `A student can read ${a} pages in ${b} minutes.`,
            ylab: "pages read",
            yunit: "",
            xlab: "time",
            xunit: "minutes",
        },
        {
            situation: `A runner can run ${a} miles in ${b} minutes.`,
            ylab: "distance",
            yunit: "miles",
            xlab: "time",
            xunit: "minutes",
        },
        {
            situation: `A bicyclist burns ${a} calories every ${b} minutes, while cycling`,
            xlab: "time",
            xunit: "minutes",
            ylab: "energy burned",
            yunit: "calories",
        },
        {
            situation: `A car can travel ${a} miles on ${b} gallons of gasoline`,
            xlab: "gas",
            xunit: "gallons",
            ylab: "distance",
            yunit: "miles",
        },
    ];
    const paramSet =
        paramSets[randInt(rand, { min: 0, max: paramSets.length - 1 })];
    const xvar = paramSet.xlab?.[0] ?? "x";
    const yvar = paramSet.ylab?.[0] ?? "y";
    return {
        xvar,
        yvar,
        graphType: "B",
        ...paramSet,
    };
}

export { randPrompt };
