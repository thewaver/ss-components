import { SVGAnimationUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Animation/SVGAnimationDefs.utils";
import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { GradientConfig } from "../../SVGDefs.types";

export const flow_2s: GradientConfig = {
    computeSVGDefs: (id, __, defs) => [
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
                                { value: defs.colors.primary },
                                { value: defs.colors.secondary },
                                { value: defs.colors.primary },
                                { value: defs.colors.secondary },
                                { value: defs.colors.primary },
                                { value: defs.colors.secondary },
                                { value: defs.colors.primary },
                                { value: defs.colors.secondary },
                                { value: defs.colors.primary },
                                { value: defs.colors.secondary },
                                { value: defs.colors.primary },
                                { value: defs.colors.secondary },
                                { value: defs.colors.primary },
                                { value: defs.colors.secondary },
                                { value: defs.colors.primary },
                            ],
                            spreadKind: "banded",
                            scale: { width: 2, height: 1 },
                            offset: { x: 0.5, y: 0 },
                        },
                        (x1, y1, x2, y2) => SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0, -1], defs),
                    ),
            },
        },
    ],
};
