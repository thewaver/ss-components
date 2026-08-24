import { MathUtils } from "@thewaver/ss-utils";

import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import { SVGAnimations } from "../../SVGAnimations.const";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const flow_diag_3s: GradientConfig = {
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
                                { value: defs.colors.tertiary },
                                { value: defs.colors.primary },
                                { value: defs.colors.secondary },
                                { value: defs.colors.tertiary },
                                { value: defs.colors.primary },
                                { value: defs.colors.secondary },
                                { value: defs.colors.tertiary },
                                { value: defs.colors.primary },
                                { value: defs.colors.secondary },
                                { value: defs.colors.tertiary },
                                { value: defs.colors.primary },
                            ],
                            spreadKind: "banded",
                            angle: MathUtils.unwarpAngle(45, defs.getSize()),
                            scale: { width: 2, height: 2 },
                            offset: SVGDefsUtils.offsetDiagonally(0.25, MathUtils.unwarpAngle(45, defs.getSize())),
                        },
                        (x1, y1, x2, y2) =>
                            SVGAnimations.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                MathUtils.unwarpAngle(45, defs.getSize()),
                                [0, -0.5],
                                defs,
                            ),
                    ),
            },
        },
    ],
};
