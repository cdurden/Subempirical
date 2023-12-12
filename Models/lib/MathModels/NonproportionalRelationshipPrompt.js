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
    const yint = randInt(rand, { min: 1, max: 15 });
    const xint = randInt(rand, { min: 1, max: 15 });
    const paramSets = new Map([
        [
            "A",
            [
                {
                    situation: `A taxi charges \\$${yint} per ride plus \\$${a} for every ${
                        b > 1 ? b : ""
                    } mile${b > 1 ? "s" : ""}.`,
                    yunit: "dollars",
                    xunit: "miles",
                    xlab: "distance",
                    ylab: "cost",
                    yint,
                },
                {
                    situation: `An online order costs \\$${a} per ${
                        b > 1 ? b : ""
                    } item${b > 1 ? "s" : ""} plus \\$${yint} for shipping.`,
                    xunit: "",
                    xlab: "items",
                    ylab: "cost",
                    yunit: "dollars",
                    yint,
                },
                {
                    situation: `To join a dance club, there is a \\$${yint} membership fee plus a \\$${a} fee every ${
                        b > 1 ? b : ""
                    } month${b > 1 ? "s" : ""}.`,
                    xlab: "membership time",
                    xunit: "months",
                    ylab: "cost",
                    yunit: "dollars",
                    yint,
                },
            ],
        ],
        [
            "C",
            [
                {
                    situation: `A data plan costs provide \\$${xint} of data for free and charges \\$${a} for each additional ${b} GB of data used.`,
                    yunit: "dollars",
                    xunit: "GB",
                    ylab: "cost",
                    xlab: "data",
                    xint,
                },
            ],
        ],
    ]);
    const graphType = ["A", "C"][randInt(rand, { min: 0, max: 1 })];

    const paramSet = paramSets.get(graphType)[
        randInt(rand, { min: 0, max: paramSets.get(graphType).length - 1 })
    ];
    /*
    const paramSet = {
        situation: `A cell phone data plan costs \\$${b} per month for 5 GB of data and \\$${y[0]} for each additional ${x[0]} GB .`,
        yunit: "dollars",
        xunit: "GB",
        ylab: "cost",
        xlab: "data",
    };
    */
    const xvar = paramSet.xlab?.[0] ?? "x";
    const yvar = paramSet.ylab?.[0] ?? "y";
    return {
        xvar,
        yvar,
        graphType,
        ...paramSet,
    };
}

export { randPrompt };
