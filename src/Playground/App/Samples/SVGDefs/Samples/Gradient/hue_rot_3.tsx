import { MathUtils } from "@thewaver/ss-utils";

import { SVGAnimationUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Animation/SVGAnimationDefs.utils";
import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const hue_rot_3: GradientConfig = {
    computeSVGDefs: (id, __, defs) => [
        {
            color: SVGDefsUtils.getBaseBorderColor(defs),
        },
        {
            gradientOrPattern: {
                id: `gradient1-${id}`,
                renderDefsElement: () =>
                    SVGGradientDefsUtils.computeLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: defs.colors.primary },
                                { value: defs.colors.secondary },
                                { value: defs.colors.tertiary },
                            ],
                            angle: 0,
                        },
                        <>
                            {SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs)}
                            {SVGAnimationUtils.Gradient.cycleSmoothColors(
                                `gradient1-${id}`,
                                [
                                    [
                                        defs.colors.primary,
                                        defs.colors.secondary,
                                        defs.colors.tertiary,
                                        defs.colors.primary,
                                    ],
                                    [
                                        defs.colors.secondary,
                                        defs.colors.tertiary,
                                        defs.colors.primary,
                                        defs.colors.secondary,
                                    ],
                                    [
                                        defs.colors.tertiary,
                                        defs.colors.primary,
                                        defs.colors.secondary,
                                        defs.colors.tertiary,
                                    ],
                                ],
                                defs,
                            )}
                        </>,
                    ),
            },
            filter: SVGDefsUtils.getBaseBlur(id, defs),
        },
    ],
};
