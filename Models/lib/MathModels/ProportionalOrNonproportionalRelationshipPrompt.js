import * as ProportionalRelationshipPrompt from "./ProportionalRelationshipPromptB.js";
import * as NonproportionalRelationshipPrompt from "./NonproportionalRelationshipPrompt.js";

function randInt(rand, { min, max }) {
    return Math.floor(rand() * (max + 1 - (min ?? 0))) + (min ?? 0);
}

function randPrompt(rand, params) {
    const i = randInt(rand, { min: 0, max: 1 });
    if (i === 0) {
        return {
            ...ProportionalRelationshipPrompt.randPrompt(rand, params),
            isProportional: "true",
        };
    } else {
        return {
            ...NonproportionalRelationshipPrompt.randPrompt(rand, params),
            isProportional: "false",
        };
    }
}

export { randPrompt };
