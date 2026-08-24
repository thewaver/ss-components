import { MathUtils } from "@thewaver/ss-utils";

import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import { SVGAnimations } from "../../SVGAnimations.const";
import type { PatternConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const whirlCurved_2: PatternConfig = {
    computeSVGDefs: (id, __, defs) => [
        {
            color: SVGDefsUtils.getBaseBackgroundColor(defs),
        },
        {
            gradientOrPattern: {
                id: `gradient1-${id}`,
                renderDefsElement: () =>
                    SVGGradientDefsUtils.computeRadialGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: defs.colors.primary },
                                { value: defs.colors.primary },
                                { value: defs.colors.secondary },
                                { value: defs.colors.primary },
                            ],
                        },
                        SVGAnimations.Radial.grow([0, 2], {
                            ...defs,
                            animationDurationMs: defs.animationDurationMs * 0.5,
                        }),
                    ),
            },
            clipPath: {
                id: `clip1-${id}`,
                renderDefsElement: () => (
                    <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                        {SVGAnimations.Path.rotatingWedges(
                            Math.max(defs.cellSize.width, defs.cellSize.height),
                            0.75,
                            -4,
                            MathUtils.getIntermediateValues(0, 360, 12),
                            defs,
                        )}
                    </clipPath>
                ),
            },
        },
    ],
};
