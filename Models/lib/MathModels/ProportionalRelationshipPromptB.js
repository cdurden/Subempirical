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
            situation: `A student can read ${a} pages in ${
                b > 1 ? b : "a"
            } minute${b > 1 ? "s" : ""}.`,
            ylab: "pages read",
            yunit: "",
            xlab: "time",
            xunit: "minutes",
        },
        {
            situation: `A runner can run ${a} miles in ${
                b > 1 ? b : "a"
            } minute${b > 1 ? "s" : ""}.`,
            ylab: "distance",
            yunit: "miles",
            xlab: "time",
            xunit: "minutes",
        },
        {
            situation: `A bicyclist burns ${a} calories every ${
                b > 1 ? b : ""
            } minute${b > 1 ? "s" : ""}, while cycling`,
            xlab: "time",
            xunit: "minutes",
            ylab: "energy burned",
            yunit: "calories",
        },
        {
            situation: `A car can travel ${a} miles on ${
                b > 1 ? b : "a"
            } gallon${b > 1 ? "s" : ""} of gasoline`,
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
