import { SVGAnimationUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Animation/SVGAnimationDefs.utils";
import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const hue_pulse_2: GradientConfig = {
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
                            colors: [{ value: defs.colors.primary }],
                            angle: 90,
                        },
                        SVGAnimationUtils.Gradient.cycleSmoothColors(
                            `gradient1-${id}`,
                            [
                                [
                                    defs.colors.primary,
                                    defs.colors.secondary,
                                    defs.colors.primary,
                                    defs.colors.secondary,
                                    defs.colors.primary,
                                ],
                            ],
                            defs,
                        ),
                    ),
            },
            filter: SVGDefsUtils.getBaseBlur(id, defs),
        },
    ],
};
