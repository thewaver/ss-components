import type { IterationConfig } from "../../SVGDefs.types";

export const repeat3_3: IterationConfig = {
    computeDefs: (animationDurationMs) => ({
        animationIterationPatterns: [
            {
                count: 3,
                nextIndex: 1,
            },
            {
                beginDelayMs: animationDurationMs * 3,
                count: 3,
                nextIndex: 1,
            },
        ],
    }),
};
