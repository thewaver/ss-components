import { MathUtils, ObjectUtils, type Size2d } from "@thewaver/ss-utils";

import type { CSSBorderRadius, CSSBorderWidth } from "../../../../Lib/Abstracts/CSS/CSS.types";
import { SVGFilterDefsFactory } from "../../../../Lib/Abstracts/SVG/Defs/Filter/SVGFilterDefs.factory";
import { SVGGradientDefsUtils } from "../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { SVGDefs } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.types";
import type { SurfaceInteractionStates } from "../../../../Lib/Fundamentals/Surface/Surface.types";
import { SurfaceAnimationUtils } from "../../../../Lib/Fundamentals/Surface/Surface.utils";
import type { SurfaceConfigColors } from "./SurfacePage.types";

export type SurfaceColorConfigDefs = SurfaceAnimationUtils.SurfaceAnimationDefs & {
    getSize: () => Size2d;
    getBorderWidths?: () => CSSBorderWidth;
    getBorderRadii: () => CSSBorderRadius;
    getColors: () => SurfaceConfigColors;
    getBlurWidth?: () => number;
};

export type SurfaceConfigDefs = {
    getColorDefs: (id: string, state: () => SurfaceInteractionStates, defs: SurfaceColorConfigDefs) => SVGDefs[];
};

const getBaseBorderColor = (defs: SurfaceColorConfigDefs) =>
    `hsl(from ${defs.getColors().background} h s calc(l * 1.5) / 50%)`;

const getBaseBlur = (stdDeviation: number = 0) =>
    stdDeviation
        ? {
              id: "border-blur-filter",
              defsElement: new SVGFilterDefsFactory("border-blur-filter")
                  .addGaussianBlurFilter({ stdDeviation })
                  .getFilterPrimitives({ method: "isolate" }),
          }
        : undefined;

export const SURFACE_CONFIGS = {
    plain: {
        getColorDefs: (_, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
        ],
    },

    // CORNY

    cornyDesync_4x: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getRadialGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: defs.getColors().primary },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                            ],
                            origin: { x: 0, y: 0 },
                        },
                        SurfaceAnimationUtils.Radial.grow([0, 1, 1, 1, 1, 0, 0, 0, 0], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
            {
                gradient: {
                    id: `gradient3-${id}`,
                    defsElement: SVGGradientDefsUtils.getRadialGradient(
                        {
                            id: `gradient3-${id}`,
                            colors: [
                                { value: defs.getColors().primary },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                            ],
                            origin: { x: 1, y: 1 },
                        },
                        SurfaceAnimationUtils.Radial.grow([0, 0, 1, 1, 1, 1, 0, 0, 0], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getRadialGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                            origin: { x: 1, y: 0 },
                        },
                        SurfaceAnimationUtils.Radial.grow([0, 0, 0, 1, 1, 1, 1, 0, 0], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
            {
                gradient: {
                    id: `gradient4-${id}`,
                    defsElement: SVGGradientDefsUtils.getRadialGradient(
                        {
                            id: `gradient4-${id}`,
                            colors: [
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                            origin: { x: 0, y: 1 },
                        },
                        SurfaceAnimationUtils.Radial.grow([0, 0, 0, 0, 1, 1, 1, 1, 0], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    // FLOW

    flow_2s: {
        getColorDefs: (id, __, defs) => [
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().primary },
                            ],
                            spreadKind: "banded",
                            scale: { width: 2, height: 1 },
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0.5, -0.5], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    flow_3: {
        getColorDefs: (id, __, defs) => [
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().tertiary },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().tertiary },
                                { value: defs.getColors().primary },
                            ],
                            scale: { width: 2, height: 1 },
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0.5, -0.5], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    flowDiagonal_2s: {
        getColorDefs: (id, __, defs) => [
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().primary },
                            ],
                            spreadKind: "banded",
                            angle: 45,
                            scale: { width: 3, height: 3 },
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [0.75, 0.75],
                                    [-0.75, -0.75],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    flowDiagonal_3: {
        getColorDefs: (id, __, defs) => [
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().tertiary },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().tertiary },
                                { value: defs.getColors().primary },
                            ],
                            angle: 45,
                            scale: { width: 3, height: 3 },
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [0.75, 0.75],
                                    [-0.75, -0.75],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    // MERGE

    merge_1v1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: defs.getColors().primary },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                            ],
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
                blend: true,
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                            angle: 180,
                        },
                        (x1, y1, x2, y2) => SurfaceAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [1, -1, 1], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
                blend: true,
            },
        ],
    },

    mergeDiagonal_1v1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: defs.getColors().primary },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                            ],
                            angle: 45,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [-1.25, -1.25],
                                    [1.25, 1.25],
                                    [-1.25, -1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
                blend: true,
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                            angle: 225,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [1.25, 1.25],
                                    [-1.25, -1.25],
                                    [1.25, 1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
                blend: true,
            },
        ],
    },

    mergeDiagonalDesync_4x: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: defs.getColors().primary },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                            ],
                            angle: 45,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [-1.25, -1.25],
                                    [0, 0],
                                    [0, 0],
                                    [-1.25, -1.25],
                                    [-1.25, -1.25],
                                    [-1.25, -1.25],
                                    [-1.25, -1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
                blend: true,
            },
            {
                gradient: {
                    id: `gradient3-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient3-${id}`,
                            colors: [
                                { value: defs.getColors().primary },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                            ],
                            angle: 225,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [1.25, 1.25],
                                    [1.25, 1.25],
                                    [0, 0],
                                    [0, 0],
                                    [1.25, 1.25],
                                    [1.25, 1.25],
                                    [1.25, 1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
                blend: true,
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                            angle: 135,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [1.25, -1.25],
                                    [1.25, -1.25],
                                    [1.25, -1.25],
                                    [0, 0],
                                    [0, 0],
                                    [1.25, -1.25],
                                    [1.25, -1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
                blend: true,
            },
            {
                gradient: {
                    id: `gradient4-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient4-${id}`,
                            colors: [
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                            angle: 315,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [-1.25, 1.25],
                                    [-1.25, 1.25],
                                    [-1.25, 1.25],
                                    [-1.25, 1.25],
                                    [0, 0],
                                    [0, 0],
                                    [-1.25, 1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
                blend: true,
            },
        ],
    },

    // ORBIT

    orbit_1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    orbit_1v1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(360, 0, 12), defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    orbitDesync_2v1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [{ value: defs.getColors().tertiary }, { value: defs.getColors().secondary }],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(360, 0, 12), defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    orbitDesync_3x: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), {
                            ...defs,
                            getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                        }),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
                blend: true,
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
                blend: true,
            },
            {
                gradient: {
                    id: `gradient3-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient3-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().tertiary} r g b / 0)` },
                                { value: defs.getColors().tertiary },
                                { value: `rgb(from ${defs.getColors().tertiary} r g b / 0)` },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), {
                            ...defs,
                            getAnimationDurationMs: () => defs.getAnimationDurationMs() * 2,
                        }),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
                blend: true,
            },
        ],
    },

    // ROULETTE

    roulette_2: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getRadialGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: defs.getColors().primary },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: defs.getColors().primary },
                            ],
                        },
                        SurfaceAnimationUtils.Radial.grow([0, 2], {
                            ...defs,
                            getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                        }),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingWedges(
                                48,
                                1.5,
                                MathUtils.getIntermediateValues(0, 360, 12),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
        ],
    },

    // SCAN

    scan_1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                            ],
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    scan_1v1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                            ],
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                            angle: 90,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepOrthogonal("y", y1, y2, [-1, 1, -1], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    scanDiagonal_1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                            ],
                            angle: 45,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [-1.25, -1.25],
                                    [1.25, 1.25],
                                    [-1.25, -1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    scanDiagonal_1v1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                            ],
                            angle: 45,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [-1.25, -1.25],
                                    [1.25, 1.25],
                                    [-1.25, -1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                            angle: 135,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [1.25, -1.25],
                                    [-1.25, 1.25],
                                    [1.25, -1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    // SNAKE

    snake_1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(0, 360, 12), 180),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snake_1v1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(0, 360, 12), 180),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(360, 0, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(360, 0, 12), 180),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snake_2: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(0, 360, 12), 180),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(180, 540, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(180, 540, 12), 180),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snake_4: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary, stop: 75 },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)`, stop: 75 },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(0, 360, 12), 180),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary, stop: 75 },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 75 },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(90, 450, 12), 180),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
            {
                gradient: {
                    id: `gradient3-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient3-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary, stop: 75 },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)`, stop: 75 },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(180, 540, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip3-${id}`,
                    defsElement: (
                        <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(180, 540, 12), 180),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
            {
                gradient: {
                    id: `gradient4-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient4-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary, stop: 75 },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 75 },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(270, 630, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip4-${id}`,
                    defsElement: (
                        <clipPath id={`clip4-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(270, 630, 12), 180),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snakeDesync_3x: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(0, 360, 12), 180),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(180, 540, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(180, 540, 12), 180),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
            {
                gradient: {
                    id: `gradient3-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient3-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().tertiary} r g b / 0)` },
                                { value: defs.getColors().tertiary },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), {
                            ...defs,
                            getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                        }),
                    ),
                },
                clipPath: {
                    id: `clip3-${id}`,
                    defsElement: (
                        <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(0, 360, 12), 180),
                                {
                                    ...defs,
                                    getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                                },
                            )}
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snakeWait_1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                            ],
                        },
                        SurfaceAnimationUtils.Linear.rotate(
                            [
                                ...MathUtils.getIntermediateValues(90, 270, 12),
                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                ...MathUtils.getIntermediateValues(270, 450, 12),
                                ...MathUtils.getIntermediateValues(450, 450, 12),
                            ],
                            defs,
                        ),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(
                                    [
                                        ...MathUtils.getIntermediateValues(90, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                    ],
                                    180,
                                ),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snakeWait_3x1s: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                            ],
                            angle: 90,
                        },
                        SurfaceAnimationUtils.Linear.rotate(
                            [
                                ...MathUtils.getIntermediateValues(90, 450, 12),
                                ...MathUtils.getIntermediateValues(450, 450, 12),
                                ...MathUtils.getIntermediateValues(450, 450, 12),
                            ],
                            defs,
                        ),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(
                                    [
                                        ...MathUtils.getIntermediateValues(90, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                    ],
                                    180,
                                ),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary },
                            ],
                            angle: 90,
                        },
                        SurfaceAnimationUtils.Linear.rotate(
                            [
                                ...MathUtils.getIntermediateValues(90, 450, 12),
                                ...MathUtils.getIntermediateValues(450, 450, 12),
                            ],
                            defs,
                        ),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(
                                    [
                                        ...MathUtils.getIntermediateValues(90, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                    ],
                                    180,
                                ),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
            {
                gradient: {
                    id: `gradient3-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient3-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().tertiary} r g b / 0)` },
                                { value: defs.getColors().tertiary },
                            ],
                            angle: 90,
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip3-${id}`,
                    defsElement: (
                        <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(90, 450, 12), 180),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snakeWait_3x2s: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                            ],
                            angle: 90,
                        },
                        SurfaceAnimationUtils.Linear.rotate(
                            [
                                ...MathUtils.getIntermediateValues(90, 270, 12),
                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                ...MathUtils.getIntermediateValues(270, 450, 12),
                                ...MathUtils.getIntermediateValues(450, 450, 12),
                                ...MathUtils.getIntermediateValues(450, 450, 12),
                            ],
                            defs,
                        ),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(
                                    [
                                        ...MathUtils.getIntermediateValues(90, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                    ],
                                    180,
                                ),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary },
                            ],
                            angle: 90,
                        },
                        SurfaceAnimationUtils.Linear.rotate(
                            [
                                ...MathUtils.getIntermediateValues(90, 270, 12),
                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                ...MathUtils.getIntermediateValues(270, 450, 12),
                                ...MathUtils.getIntermediateValues(450, 450, 12),
                            ],
                            defs,
                        ),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(
                                    [
                                        ...MathUtils.getIntermediateValues(90, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                    ],
                                    180,
                                ),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
            {
                gradient: {
                    id: `gradient3-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient3-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().tertiary} r g b / 0)` },
                                { value: defs.getColors().tertiary },
                            ],
                            angle: 90,
                        },
                        SurfaceAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip3-${id}`,
                    defsElement: (
                        <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                            {SurfaceAnimationUtils.Path.getRotatingArc(
                                ObjectUtils.zipArray(MathUtils.getIntermediateValues(90, 450, 12), 180),
                                defs,
                            )}
                        </clipPath>
                    ),
                },
            },
        ],
    },

    // SWEEP

    sweep_1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary, stop: 50 },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 50 },
                            ],
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1.25, 1.25], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    sweep_1v1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary, stop: 50 },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 50 },
                            ],
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1.25, 1.25], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary, stop: 50 },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)`, stop: 50 },
                            ],
                            angle: 180,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [1.25, -1.25], defs),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    sweepDiagonal_1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary, stop: 50 },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 50 },
                            ],
                            angle: 45,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [-1.25, -1.25],
                                    [1.25, 1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    sweepDiagonal_1v1: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary, stop: 50 },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 50 },
                            ],
                            angle: 45,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [-1.25, -1.25],
                                    [1.25, 1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary, stop: 50 },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)`, stop: 50 },
                            ],
                            angle: 225,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [1.25, 1.25],
                                    [-1.25, -1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },

    sweepDiagonalDesync_4x: {
        getColorDefs: (id, __, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary, stop: 50 },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 50 },
                            ],
                            angle: 45,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [-1.25, -1.25],
                                    [0, 0],
                                    [1.25, 1.25],
                                    [1.25, 1.25],
                                    [1.25, 1.25],
                                    [1.25, 1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient2-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary, stop: 50 },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)`, stop: 50 },
                            ],
                            angle: 225,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [1.25, 1.25],
                                    [1.25, 1.25],
                                    [0, 0],
                                    [-1.25, -1.25],
                                    [-1.25, -1.25],
                                    [-1.25, -1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
            {
                gradient: {
                    id: `gradient3-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient3-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary, stop: 50 },
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 50 },
                            ],
                            angle: 135,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [1.25, -1.25],
                                    [1.25, -1.25],
                                    [1.25, -1.25],
                                    [0, 0],
                                    [-1.25, 1.25],
                                    [-1.25, 1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
            {
                gradient: {
                    id: `gradient4-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient4-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary, stop: 50 },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)`, stop: 50 },
                            ],
                            angle: 315,
                        },
                        (x1, y1, x2, y2) =>
                            SurfaceAnimationUtils.Linear.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [
                                    [-1.25, 1.25],
                                    [-1.25, 1.25],
                                    [-1.25, 1.25],
                                    [-1.25, 1.25],
                                    [0, 0],
                                    [1.25, -1.25],
                                ],
                                defs,
                            ),
                    ),
                },
                filter: getBaseBlur(defs.getBlurWidth?.() ?? 0),
            },
        ],
    },
} as const satisfies Record<string, SurfaceConfigDefs>;
