import { SVGAnimationUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Animation/SVGAnimationDefs.utils";
import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const scan_diag_1: GradientConfig = {
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
                                { value: defs.colors.primary },
                                { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                            ],
                            angle: 45,
                            offset: SVGDefsUtils.offsetDiagonally(-1.25, 45),
                        },
                        (x1, y1, x2, y2) =>
                            SVGAnimationUtils.Linear.sweepDiagonal(x1, y1, x2, y2, 45, [0, 2.5, 0], defs),
                    ),
            },
            filter: SVGDefsUtils.getBaseBlur(id, defs),
        },
    ],
};
