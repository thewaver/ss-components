import type { Size2d } from "@thewaver/ss-utils";

import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { SVGAnimationDefs } from "../../../../Lib/Abstracts/SVG/Defs/Animation/SVGAnimationDefs.types";
import type { SVGDefs } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.types";

export type SVGDefsColors = { [K in "primary" | "secondary" | "tertiary" | "background"]: string };

export type IterationConfig = {
    computeDefs: (animationDurationMs: number) => Pick<SVGAnimationDefs, "animationIterationPatterns">;
};

export type PatternElementDefs = SVGAnimationDefs & {
    getSize: () => Size2d;
    cellSize: Size2d;
    colors: SVGDefsColors;
    blurWidth?: number;
};

export type PatternConfig = {
    computeSVGDefs: (
        id: string,
        getInteractionFlags: (() => InteractionFlags) | undefined,
        defs: PatternElementDefs,
    ) => SVGDefs[];
};

export type GradientElementDefs = SVGAnimationDefs & {
    getSize: () => Size2d;
    colors: SVGDefsColors;
    blurWidth?: number;
};

export type GradientConfig = {
    computeSVGDefs: (
        id: string,
        getInteractionFlags: (() => InteractionFlags) | undefined,
        defs: GradientElementDefs,
    ) => SVGDefs[];
};
