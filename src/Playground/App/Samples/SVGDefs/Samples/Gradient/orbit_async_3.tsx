import { MathUtils } from "@thewaver/ss-utils";

import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import { SVGAnimations } from "../../SVGAnimations.const";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const orbit_async_3: GradientConfig = {
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
                        },
                        SVGAnimations.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                    ),
            },
            filter: SVGDefsUtils.getBaseBlur(id, defs),
            blend: true,
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
                        },
                        SVGAnimations.Linear.rotate(
                            [
                                ...MathUtils.getIntermediateValues(0, 360, 12),
                                ...MathUtils.getIntermediateValues(0, 360, 12),
                            ],
                            defs,
                        ),
                    ),
            },
            filter: SVGDefsUtils.getBaseBlur(id, defs),
            blend: true,
        },
        {
            gradientOrPattern: {
                id: `gradient3-${id}`,
                renderDefsElement: () =>
                    SVGGradientDefsUtils.computeLinearGradient(
                        {
                            id: `gradient3-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.colors.tertiary} r g b / 0)` },
                                { value: defs.colors.tertiary },
                                { value: `rgb(from ${defs.colors.tertiary} r g b / 0)` },
                            ],
                        },
                        SVGAnimations.Linear.rotate(
                            [
                                ...MathUtils.getIntermediateValues(0, 360, 12),
                                ...MathUtils.getIntermediateValues(0, 360, 12),
                                ...MathUtils.getIntermediateValues(0, 360, 12),
                            ],
                            defs,
                        ),
                    ),
            },
            filter: SVGDefsUtils.getBaseBlur(id, defs),
            blend: true,
        },
    ],
};
