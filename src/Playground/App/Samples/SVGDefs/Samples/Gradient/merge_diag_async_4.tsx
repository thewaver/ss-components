import { SVGGradientDefsUtils } from "../../../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import { SVGAnimations } from "../../SVGAnimations.const";
import type { GradientConfig } from "../../SVGDefs.types";
import { SVGDefsUtils } from "../../SVGDefs.utils";

export const merge_diag_async_4: GradientConfig = {
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
                                { value: defs.colors.primary },
                                { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                            ],
                            angle: 45,
                            offset: SVGDefsUtils.offsetDiagonally(-1.25, 45),
                        },
                        (x1, y1, x2, y2) =>
                            SVGAnimations.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                45,
                                [0, 1.25, 2.5, 1.25, 0, 0, 0, 0],
                                defs,
                            ),
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
                                { value: defs.colors.secondary },
                                { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                            ],
                            angle: 135,
                            offset: SVGDefsUtils.offsetDiagonally(-1.25, 135),
                        },
                        (x1, y1, x2, y2) =>
                            SVGAnimations.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                135,
                                [0, 0, 0, 1.25, 2.5, 1.25, 0, 0],
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
                                { value: defs.colors.primary },
                                { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                            ],
                            angle: 225,
                            offset: SVGDefsUtils.offsetDiagonally(-1.25, 225),
                        },
                        (x1, y1, x2, y2) =>
                            SVGAnimations.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                225,
                                [0, 0, 1.25, 2.5, 1.25, 0, 0, 0],
                                defs,
                            ),
                    ),
            },
            filter: SVGDefsUtils.getBaseBlur(id, defs),
            blend: true,
        },
        {
            gradientOrPattern: {
                id: `gradient4-${id}`,
                renderDefsElement: () =>
                    SVGGradientDefsUtils.computeLinearGradient(
                        {
                            id: `gradient4-${id}`,
                            colors: [
                                { value: defs.colors.secondary },
                                { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                            ],
                            angle: 315,
                            offset: SVGDefsUtils.offsetDiagonally(-1.25, 315),
                        },
                        (x1, y1, x2, y2) =>
                            SVGAnimations.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                315,
                                [0, 0, 0, 0, 1.25, 2.5, 1.25, 0],
                                defs,
                            ),
                    ),
            },
            filter: SVGDefsUtils.getBaseBlur(id, defs),
            blend: true,
        },
    ],
};
