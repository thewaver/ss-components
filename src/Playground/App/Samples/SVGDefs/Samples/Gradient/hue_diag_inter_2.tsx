import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import { SVGAnimations } from "../../SVGAnimations.const";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const hue_diag_inter_2: GradientConfig = {
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
                            colors: [{ value: defs.colors.primary }, { value: defs.colors.secondary }],
                            angle: 45,
                        },
                        SVGAnimations.Gradient.cycleSmoothColors(
                            `gradient1-${id}`,
                            [
                                [
                                    defs.colors.primary,
                                    defs.colors.secondary,
                                    defs.colors.secondary,
                                    defs.colors.primary,
                                    defs.colors.primary,
                                ],
                                [
                                    defs.colors.primary,
                                    defs.colors.primary,
                                    defs.colors.tertiary,
                                    defs.colors.tertiary,
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
