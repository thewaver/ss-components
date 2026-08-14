import { SVGAnimationUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Animation/SVGAnimationDefs.utils";
import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const sweep_1: GradientConfig = {
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
                                { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                { value: defs.colors.primary, stop: 50 },
                                { value: `rgb(from ${defs.colors.primary} r g b / 0)`, stop: 50 },
                            ],
                            offset: { x: -1.25, y: 0 },
                        },
                        (x1, y1, x2, y2) => SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0, 2.5], defs),
                    ),
            },
            filter: SVGDefsUtils.getBaseBlur(id, defs),
        },
    ],
};
