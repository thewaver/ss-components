import { MathUtils, ObjectUtils, type Size2d } from "@thewaver/ss-utils";

import type { InteractionFlags } from "../../Interaction/Interaction.types";
import type { SVGAnimationDefs } from "./Animation/SVGAnimationDefs.types";
import { SVGAnimationUtils } from "./Animation/SVGAnimationDefs.utils";
import { SVGFilterDefsFactory } from "./Filter/SVGFilterDefs.factory";
import { SVGGradientDefsUtils } from "./Gradient/SVGGradientDefs.utils";
import type { SVGDefs } from "./SVGDefs.types";

export namespace SVGDefsSamples {
    export type ColorDefs = { [K in "primary" | "secondary" | "tertiary" | "background"]: string };

    type ElementDefs = SVGAnimationDefs & {
        getSize: () => Size2d;
        getColors: () => ColorDefs;
        getBlurWidth?: () => number;
    };

    export type ConfigDefs = {
        getSVGDefs: (
            id: string,
            getInteractionFlags: (() => InteractionFlags) | undefined,
            defs: ElementDefs,
        ) => SVGDefs[];
    };

    const getBaseBorderColor = (defs: ElementDefs) =>
        `hsl(from ${defs.getColors().background} h s calc(l * 1.5) / 50%)`;

    const getBaseBlur = (id: string, defs: ElementDefs) =>
        defs.getBlurWidth
            ? {
                  id: `border-blur-filter-${id}`,
                  defsElement: new SVGFilterDefsFactory(`border-blur-filter-${id}`)
                      .addGaussianBlurFilter({ stdDeviation: defs.getBlurWidth() })
                      .getFilterPrimitives({ method: "isolate", elementSize: defs.getSize() }),
              }
            : undefined;

    export const SAMPLE_CONFIGS = {
        plain: {
            getSVGDefs: (_, __, defs) => [
                {
                    color: getBaseBorderColor(defs),
                },
            ],
        },

        // CORNY

        cornyDesync_4x: {
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Radial.grow([0, 1, 1, 1, 1, 0, 0, 0, 0], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
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
                            SVGAnimationUtils.Radial.grow([0, 0, 1, 1, 1, 1, 0, 0, 0], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
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
                            SVGAnimationUtils.Radial.grow([0, 0, 0, 1, 1, 1, 1, 0, 0], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
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
                            SVGAnimationUtils.Radial.grow([0, 0, 0, 0, 1, 1, 1, 1, 0], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        // FLOW

        flow_2s: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0.5, -0.5], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        flow_3: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0.5, -0.5], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        flowDiagonal_2s: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        flowDiagonal_3: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        // MERGE

        merge_1v1: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
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
                            (x1, y1, x2, y2) => SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [1, -1, 1], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
                    blend: true,
                },
            ],
        },

        mergeDiagonal_1v1: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
                    blend: true,
                },
            ],
        },

        mergeDiagonalDesync_4x: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
                    blend: true,
                },
            ],
        },

        // ORBIT

        orbit_1: {
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        orbit_1v1: {
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(360, 0, 12), defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        orbitDesync_2v1: {
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(360, 0, 12), defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        orbitDesync_3x: {
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), {
                                ...defs,
                                getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                            }),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), {
                                ...defs,
                                getAnimationDurationMs: () => defs.getAnimationDurationMs() * 2,
                            }),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
                    blend: true,
                },
            ],
        },

        // ROULETTE

        roulette_2: {
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Radial.grow([0, 2], {
                                ...defs,
                                getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                            }),
                        ),
                    },
                    clipPath: {
                        id: `clip1-${id}`,
                        defsElement: (
                            <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingWedges(
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
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        scan_1v1: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
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
                                SVGAnimationUtils.Linear.sweepOrthogonal("y", y1, y2, [-1, 1, -1], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        scanDiagonal_1: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        scanDiagonal_1v1: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        // SNAKE

        snake_1: {
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                        ),
                    },
                    clipPath: {
                        id: `clip1-${id}`,
                        defsElement: (
                            <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                        ),
                    },
                    clipPath: {
                        id: `clip1-${id}`,
                        defsElement: (
                            <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(360, 0, 12), defs),
                        ),
                    },
                    clipPath: {
                        id: `clip2-${id}`,
                        defsElement: (
                            <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                        ),
                    },
                    clipPath: {
                        id: `clip1-${id}`,
                        defsElement: (
                            <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(180, 540, 12), defs),
                        ),
                    },
                    clipPath: {
                        id: `clip2-${id}`,
                        defsElement: (
                            <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                        ),
                    },
                    clipPath: {
                        id: `clip1-${id}`,
                        defsElement: (
                            <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                        ),
                    },
                    clipPath: {
                        id: `clip2-${id}`,
                        defsElement: (
                            <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(180, 540, 12), defs),
                        ),
                    },
                    clipPath: {
                        id: `clip3-${id}`,
                        defsElement: (
                            <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(270, 630, 12), defs),
                        ),
                    },
                    clipPath: {
                        id: `clip4-${id}`,
                        defsElement: (
                            <clipPath id={`clip4-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                        ),
                    },
                    clipPath: {
                        id: `clip1-${id}`,
                        defsElement: (
                            <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(180, 540, 12), defs),
                        ),
                    },
                    clipPath: {
                        id: `clip2-${id}`,
                        defsElement: (
                            <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), {
                                ...defs,
                                getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                            }),
                        ),
                    },
                    clipPath: {
                        id: `clip3-${id}`,
                        defsElement: (
                            <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Linear.rotate(
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
                                {SVGAnimationUtils.Path.getRotatingArc(
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
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Linear.rotate(
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
                                {SVGAnimationUtils.Path.getRotatingArc(
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
                            SVGAnimationUtils.Linear.rotate(
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
                                {SVGAnimationUtils.Path.getRotatingArc(
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                        ),
                    },
                    clipPath: {
                        id: `clip3-${id}`,
                        defsElement: (
                            <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
            getSVGDefs: (id, __, defs) => [
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
                            SVGAnimationUtils.Linear.rotate(
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
                                {SVGAnimationUtils.Path.getRotatingArc(
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
                            SVGAnimationUtils.Linear.rotate(
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
                                {SVGAnimationUtils.Path.getRotatingArc(
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
                            SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                        ),
                    },
                    clipPath: {
                        id: `clip3-${id}`,
                        defsElement: (
                            <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingArc(
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
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1.25, 1.25], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        sweep_1v1: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1.25, 1.25], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
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
                                SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [1.25, -1.25], defs),
                        ),
                    },
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        sweepDiagonal_1: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        sweepDiagonal_1v1: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
                },
            ],
        },

        sweepDiagonalDesync_4x: {
            getSVGDefs: (id, __, defs) => [
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
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
                                SVGAnimationUtils.Linear.sweepDiagonal(
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
                    filter: getBaseBlur(id, defs),
                },
            ],
        },
    } as const satisfies Record<string, ConfigDefs>;
}
