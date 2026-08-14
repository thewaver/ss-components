import type { IterationConfig } from "../../SVGDefs.types";

export const repeat2_1: IterationConfig = {
    computeDefs: (animationDurationMs) => ({
        animationIterationPatterns: [
            {
                count: 2,
                nextIndex: 1,
            },
            {
                beginDelayMs: animationDurationMs,
                count: 2,
                nextIndex: 1,
            },
        ],
    }),
};
