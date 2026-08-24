import { MathUtils, ObjectUtils } from "@thewaver/ss-utils";

import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import { SVGAnimations } from "../../SVGAnimations.const";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const snake_4: GradientConfig = {
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
                                { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                { value: defs.colors.secondary, stop: 50 },
                                { value: `rgb(from ${defs.colors.secondary} r g b / 0)`, stop: 50 },
                            ],
                        },
                        SVGAnimations.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                    ),
            },
            clipPath: {
                id: `clip1-${id}`,
                renderDefsElement: () => (
                    <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                        {SVGAnimations.Path.rotatingArc(
                            ObjectUtils.zipArray("stretch", MathUtils.getIntermediateValues(0, 360, 12), [180]),
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
                                { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                { value: defs.colors.primary, stop: 50 },
                                { value: `rgb(from ${defs.colors.primary} r g b / 0)`, stop: 50 },
                            ],
                            angle: 90,
                        },
                        SVGAnimations.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                    ),
            },
            clipPath: {
                id: `clip2-${id}`,
                renderDefsElement: () => (
                    <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                        {SVGAnimations.Path.rotatingArc(
                            ObjectUtils.zipArray("stretch", MathUtils.getIntermediateValues(90, 450, 12), [180]),
                            defs,
                        )}
                    </clipPath>
                ),
            },
        },
        {
            gradientOrPattern: {
                id: `gradient3-${id}`,
                renderDefsElement: () =>
                    SVGGradientDefsUtils.computeLinearGradient(
                        {
                            id: `gradient3-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                { value: defs.colors.secondary, stop: 50 },
                                { value: `rgb(from ${defs.colors.secondary} r g b / 0)`, stop: 50 },
                            ],
                            angle: 180,
                        },
                        SVGAnimations.Linear.rotate(MathUtils.getIntermediateValues(180, 540, 12), defs),
                    ),
            },
            clipPath: {
                id: `clip3-${id}`,
                renderDefsElement: () => (
                    <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                        {SVGAnimations.Path.rotatingArc(
                            ObjectUtils.zipArray("stretch", MathUtils.getIntermediateValues(180, 540, 12), [180]),
                            defs,
                        )}
                    </clipPath>
                ),
            },
        },
        {
            gradientOrPattern: {
                id: `gradient4-${id}`,
                renderDefsElement: () =>
                    SVGGradientDefsUtils.computeLinearGradient(
                        {
                            id: `gradient4-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                { value: defs.colors.primary, stop: 50 },
                                { value: `rgb(from ${defs.colors.primary} r g b / 0)`, stop: 50 },
                            ],
                            angle: 270,
                        },
                        SVGAnimations.Linear.rotate(MathUtils.getIntermediateValues(270, 630, 12), defs),
                    ),
            },
            clipPath: {
                id: `clip4-${id}`,
                renderDefsElement: () => (
                    <clipPath id={`clip4-${id}`} clipPathUnits="objectBoundingBox">
                        {SVGAnimations.Path.rotatingArc(
                            ObjectUtils.zipArray("stretch", MathUtils.getIntermediateValues(270, 630, 12), [180]),
                            defs,
                        )}
                    </clipPath>
                ),
            },
        },
    ],
};
