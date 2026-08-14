import { MathUtils, ObjectUtils } from "@thewaver/ss-utils";

import { SVGAnimationUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Animation/SVGAnimationDefs.utils";
import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const elastic_drip_3: GradientConfig = {
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
                        {SVGAnimationUtils.Path.rotatingArc(
                            ObjectUtils.zipArray(
                                "stretch",
                                [
                                    ...MathUtils.getIntermediateValues(450, 270, 12),
                                    ...MathUtils.getIntermediateValues(90, 270, 12),
                                ],
                                [
                                    ...MathUtils.getIntermediateValues(0, 360, 12),
                                    ...MathUtils.getIntermediateValues(360, 0, 12),
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
