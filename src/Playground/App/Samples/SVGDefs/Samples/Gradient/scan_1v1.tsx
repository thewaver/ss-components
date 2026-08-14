import { SVGAnimationUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Animation/SVGAnimationDefs.utils";
import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const scan_1v1: GradientConfig = {
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
                            offset: { x: -1, y: 0 },
                        },
                        (x1, y1, x2, y2) => SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0, 2, 0], defs),
                    ),
            },
            filter: SVGDefsUtils.getBaseBlur(id, defs),
        },
        {
            gradientOrPattern: {
                id: `gradient2-${id}`,
                renderDefsElement: () =>
                    SVGGradientDefsUtils.computeLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                { value: defs.colors.secondary },
                                { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                            ],
                            angle: 90,
                            offset: { x: 0, y: -1 },
                        },
                        (x1, y1, x2, y2) => SVGAnimationUtils.Linear.sweepOrthogonal("y", y1, y2, [0, 2, 0], defs),
                    ),
            },
            filter: SVGDefsUtils.getBaseBlur(id, defs),
        },
    ],
};
