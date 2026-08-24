import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import { SVGAnimations } from "../../SVGAnimations.const";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const sweep_diag_1: GradientConfig = {
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
                            angle: 45,
                            offset: SVGDefsUtils.offsetDiagonally(-1.25, 45),
                        },
                        (x1, y1, x2, y2) => SVGAnimations.Linear.sweepDiagonal(x1, y1, x2, y2, 45, [0, 2.5], defs),
                    ),
            },
            filter: SVGDefsUtils.getBaseBlur(id, defs),
        },
    ],
};
