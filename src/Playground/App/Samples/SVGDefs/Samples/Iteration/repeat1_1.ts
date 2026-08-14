import type { IterationConfig } from "../../SVGDefs.types";

export const repeat1_1: IterationConfig = {
    computeDefs: (animationDurationMs) => ({
        animationIterationPatterns: [
            {
                count: 1,
                nextIndex: 1,
            },
            {
                beginDelayMs: animationDurationMs,
                count: 1,
                nextIndex: 1,
            },
        ],
    }),
};
