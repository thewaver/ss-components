import { MathUtils } from "@thewaver/ss-utils";

import { SVGAnimationUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Animation/SVGAnimationDefs.utils";
import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const orbit_async_2v1: GradientConfig = {
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
                            colors: [{ value: defs.colors.tertiary }, { value: defs.colors.secondary }],
                        },
                        SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
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
                                { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                { value: defs.colors.primary },
                            ],
                            angle: 360,
                        },
                        SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(360, 0, 12), defs),
                    ),
            },
            filter: SVGDefsUtils.getBaseBlur(id, defs),
        },
    ],
};
