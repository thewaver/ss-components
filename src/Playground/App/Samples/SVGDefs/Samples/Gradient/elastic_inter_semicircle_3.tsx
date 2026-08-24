import { MathUtils, ObjectUtils } from "@thewaver/ss-utils";

import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import { SVGAnimations } from "../../SVGAnimations.const";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const elastic_inter_semicircle_3: GradientConfig = {
    computeSVGDefs: (id, __, defs) => [
        {
            color: SVGDefsUtils.getBaseBorderColor(defs),
        },
        {
            gradientOrPattern: {
                id: `gradient1-${id}`,
                renderDefsElement: () =>
                    SVGGradientDefsUtils.computeLinearGradient({
                        id: `gradient1-${id}`,
                        colors: [
                            { value: defs.colors.primary },
                            { value: defs.colors.secondary },
                            { value: defs.colors.tertiary },
                        ],
                        angle: 90,
                    }),
            },
            clipPath: {
                id: `clip1-${id}`,
                renderDefsElement: () => (
                    <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                        {SVGAnimations.Path.rotatingArc(
                            ObjectUtils.zipArray(
                                "stretch",
                                [
                                    ...MathUtils.getIntermediateValues(0, 0, 12),
                                    ...MathUtils.getIntermediateValues(0, 180, 12),
                                    ...MathUtils.getIntermediateValues(180, 180, 12),
                                    ...MathUtils.getIntermediateValues(180, 360, 12),
                                ],
                                [
                                    ...MathUtils.getIntermediateValues(0, 180, 12),
                                    ...MathUtils.getIntermediateValues(180, 0, 12),
                                    ...MathUtils.getIntermediateValues(0, 180, 12),
                                    ...MathUtils.getIntermediateValues(180, 0, 12),
                                ],
                            ),
                            defs,
                        )}
                    </clipPath>
                ),
            },
        },
    ],
};
