import { MathUtils, ObjectUtils } from "@thewaver/ss-utils";

import { SVGAnimationUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Animation/SVGAnimationDefs.utils";
import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const snake_inter_2: GradientConfig = {
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
                            ],
                            angle: 90,
                        },
                        SVGAnimationUtils.Linear.rotate(
                            [
                                ...MathUtils.getIntermediateValues(90, 90, 12),
                                ...MathUtils.getIntermediateValues(90, 90, 12),
                                ...MathUtils.getIntermediateValues(90, 180, 12),
                                ...MathUtils.getIntermediateValues(180, 270, 12),
                                ...MathUtils.getIntermediateValues(270, 360, 12),
                                ...MathUtils.getIntermediateValues(360, 450, 12),
                                ...MathUtils.getIntermediateValues(450, 450, 12),
                                ...MathUtils.getIntermediateValues(450, 450, 12),
                            ],
                            defs,
                        ),
                    ),
            },
            clipPath: {
                id: `clip1-${id}`,
                renderDefsElement: () => (
                    <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                        {SVGAnimationUtils.Path.rotatingArc(
                            ObjectUtils.zipArray(
                                "stretch",
                                [
                                    ...MathUtils.getIntermediateValues(90, 90, 12),
                                    ...MathUtils.getIntermediateValues(90, 90, 12),
                                    ...MathUtils.getIntermediateValues(90, 180, 12),
                                    ...MathUtils.getIntermediateValues(180, 270, 12),
                                    ...MathUtils.getIntermediateValues(270, 360, 12),
                                    ...MathUtils.getIntermediateValues(360, 450, 12),
                                    ...MathUtils.getIntermediateValues(450, 450, 12),
                                    ...MathUtils.getIntermediateValues(450, 450, 12),
                                ],
                                [180],
                            ),
                            defs,
                        )}
                    </clipPath>
                ),
            },
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
                            ],
                            angle: 270,
                        },
                        SVGAnimationUtils.Linear.rotate(
                            [
                                ...MathUtils.getIntermediateValues(90, 180, 12),
                                ...MathUtils.getIntermediateValues(180, 270, 12),
                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                ...MathUtils.getIntermediateValues(270, 360, 12),
                                ...MathUtils.getIntermediateValues(360, 450, 12),
                            ],
                            defs,
                        ),
                    ),
            },
            clipPath: {
                id: `clip2-${id}`,
                renderDefsElement: () => (
                    <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                        {SVGAnimationUtils.Path.rotatingArc(
                            ObjectUtils.zipArray(
                                "stretch",
                                [
                                    ...MathUtils.getIntermediateValues(90, 180, 12),
                                    ...MathUtils.getIntermediateValues(180, 270, 12),
                                    ...MathUtils.getIntermediateValues(270, 270, 12),
                                    ...MathUtils.getIntermediateValues(270, 270, 12),
                                    ...MathUtils.getIntermediateValues(270, 270, 12),
                                    ...MathUtils.getIntermediateValues(270, 270, 12),
                                    ...MathUtils.getIntermediateValues(270, 360, 12),
                                    ...MathUtils.getIntermediateValues(360, 450, 12),
                                ],
                                [180],
                            ),
                            defs,
                        )}
                    </clipPath>
                ),
            },
        },
    ],
};
