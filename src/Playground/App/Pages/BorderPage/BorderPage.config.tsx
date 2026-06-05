import type { Size2d } from "@thewaver/ss-utils";

import { SVGGradientDefsUtils } from "../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { SVGDefs } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.types";
import type { BorderRadiusDefs, BorderWidthDefs } from "../../../../Lib/Fundamentals/Border/Border.types";
import { BorderAnimationUtils } from "../../../../Lib/Fundamentals/Border/Border.utils";
import type { BorderConfigColors } from "./BorderPage.types";

import * as styles from "./BorderPage.css";

export type BorderFillConfigDefs = BorderAnimationUtils.BorderAnimationDefs & {
    getSize: () => Size2d;
    getBorderWidths: () => BorderWidthDefs;
    getBorderRadii: () => BorderRadiusDefs;
    getColors: () => BorderConfigColors;
};

export type BorderConfigDefs = {
    class: string;
    getFillDefs: (id: string, defs: BorderFillConfigDefs) => SVGDefs[];
};

type ZipValue<T> = T extends readonly (infer U)[] ? U : T;

type ZipTuple<T extends readonly unknown[]> = {
    [K in keyof T]: ZipValue<T[K]>;
};

const zip = <T extends readonly unknown[]>(...values: T) => {
    const lengths = values.filter(Array.isArray).map((v) => v.length);
    const length = lengths.length ? Math.min(...lengths) : 1;
    const zipped = Array.from({ length }, (_, i) => values.map((v) => (Array.isArray(v) ? v[i] : v)));

    return zipped as ZipTuple<T>[];
};

const getIntermediateValues = (from: number, to: number, stepCount: number) => {
    if (stepCount < 3) return [from, to];

    const stepSize = Math.abs(to - from) / (stepCount - 1);
    const values = Array.from({ length: stepCount - 1 }, (_, index) =>
        Math.round(from < to ? from + stepSize * index : from - stepSize * index),
    );

    values.push(to);

    return values;
};

const getBaseBorderColor = (defs: BorderFillConfigDefs) => `hsl(from ${defs.getColors().background} h s calc(l * 2))`;

export const BORDER_CONFIGS = {
    plain: {
        class: styles.borderedContainer,
        getFillDefs: (_, defs) => [
            {
                color: getBaseBorderColor(defs),
            },
        ],
    },

    // CORNY

    cornyDesync_4x: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        BorderAnimationUtils.Radial.grow([0, 1, 1, 1, 1, 0, 0, 0, 0], defs),
                    ),
                },
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
                        BorderAnimationUtils.Radial.grow([0, 0, 1, 1, 1, 1, 0, 0, 0], defs),
                    ),
                },
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
                        BorderAnimationUtils.Radial.grow([0, 0, 0, 1, 1, 1, 1, 0, 0], defs),
                    ),
                },
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
                        BorderAnimationUtils.Radial.grow([0, 0, 0, 0, 1, 1, 1, 1, 0], defs),
                    ),
                },
            },
        ],
    },

    // FLOOD

    /*flood_2: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                                { value: defs.getColors().secondary },
                            ],
                        },
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(0, 360, 0, 360, defs)}
                        </clipPath>
                    ),
                }
            },
        ],
    },*/

    // FLOW

    flow_1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        (x1, y1, x2, y2) => BorderAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0.5, -0.5], defs),
                    ),
                },
            },
        ],
    },

    flowDiagonal_1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
            },
        ],
    },

    // MERGE

    merge_1v1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        (x1, y1, x2, y2) => BorderAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
                    ),
                },
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
                        (x1, y1, x2, y2) => BorderAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [1, -1, 1], defs),
                    ),
                },
                blend: true,
            },
        ],
    },

    mergeDiagonal_1v1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
                blend: true,
            },
        ],
    },

    mergeDiagonalDesync_4x: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
                blend: true,
            },
        ],
    },

    // ORBIT

    orbit_1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(0, 360, 12), defs),
                    ),
                },
            },
        ],
    },

    orbit_1v1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(0, 360, 12), defs),
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
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                        },
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(360, 0, 12), defs),
                    ),
                },
            },
        ],
    },

    orbitDesync_2v1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(0, 360, 12), defs),
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
                                { value: defs.getColors().primary },
                            ],
                        },
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(360, 0, 12), defs),
                    ),
                },
            },
        ],
    },

    orbitDesync_3x: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(0, 360, 12), {
                            ...defs,
                            getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                        }),
                    ),
                },
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(0, 360, 12), defs),
                    ),
                },
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(0, 360, 12), {
                            ...defs,
                            getAnimationDurationMs: () => defs.getAnimationDurationMs() * 2,
                        }),
                    ),
                },
                blend: true,
            },
        ],
    },

    // SCAN

    scan_1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        (x1, y1, x2, y2) => BorderAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
                    ),
                },
            },
        ],
    },

    scan_1v1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        (x1, y1, x2, y2) => BorderAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
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
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                            angle: 90,
                        },
                        (x1, y1, x2, y2) => BorderAnimationUtils.Linear.sweepOrthogonal("y", y1, y2, [-1, 1, -1], defs),
                    ),
                },
            },
        ],
    },

    scanDiagonal_1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
            },
        ],
    },

    scanDiagonal_1v1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
            },
        ],
    },

    // SNAKE

    snake_1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(getIntermediateValues(0, 360, 12), 180),
                                defs,
                            )}
                            ,
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snake_1v1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(getIntermediateValues(0, 360, 12), 180),
                                defs,
                            )}
                            ,
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(360, 0, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(getIntermediateValues(360, 0, 12), 180),
                                defs,
                            )}
                            ,
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snake_2: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(getIntermediateValues(0, 360, 12), 180),
                                defs,
                            )}
                            ,
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(180, 540, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(getIntermediateValues(180, 540, 12), 180),
                                defs,
                            )}
                            ,
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snake_4: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(getIntermediateValues(0, 360, 12), 180),
                                defs,
                            )}
                            ,
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(90, 450, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(getIntermediateValues(90, 450, 12), 180),
                                defs,
                            )}
                            ,
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(180, 540, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip3-${id}`,
                    defsElement: (
                        <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(getIntermediateValues(180, 540, 12), 180),
                                defs,
                            )}
                            ,
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(270, 630, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip4-${id}`,
                    defsElement: (
                        <clipPath id={`clip4-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(getIntermediateValues(270, 630, 12), 180),
                                defs,
                            )}
                            ,
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snakeDesync_3x: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(0, 360, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(getIntermediateValues(0, 360, 12), 180),
                                defs,
                            )}
                            ,
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(180, 540, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(getIntermediateValues(180, 540, 12), 180),
                                defs,
                            )}
                            ,
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(0, 360, 12), {
                            ...defs,
                            getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                        }),
                    ),
                },
                clipPath: {
                    id: `clip3-${id}`,
                    defsElement: (
                        <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(zip(getIntermediateValues(0, 360, 12), 180), {
                                ...defs,
                                getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                            })}
                            ,
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snakeWait_1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        BorderAnimationUtils.Linear.rotate(
                            [
                                ...getIntermediateValues(90, 270, 12),
                                ...getIntermediateValues(270, 270, 12),
                                ...getIntermediateValues(270, 450, 12),
                                ...getIntermediateValues(450, 450, 12),
                            ],
                            defs,
                        ),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(
                                    [
                                        ...getIntermediateValues(90, 270, 12),
                                        ...getIntermediateValues(270, 270, 12),
                                        ...getIntermediateValues(270, 450, 12),
                                        ...getIntermediateValues(450, 450, 12),
                                    ],
                                    180,
                                ),
                                defs,
                            )}
                            ,
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snakeWait_3x1s: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        BorderAnimationUtils.Linear.rotate(
                            [
                                ...getIntermediateValues(90, 450, 12),
                                ...getIntermediateValues(450, 450, 12),
                                ...getIntermediateValues(450, 450, 12),
                            ],
                            defs,
                        ),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(
                                    [
                                        ...getIntermediateValues(90, 450, 12),
                                        ...getIntermediateValues(450, 450, 12),
                                        ...getIntermediateValues(450, 450, 12),
                                    ],
                                    180,
                                ),
                                defs,
                            )}
                            ,
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
                        BorderAnimationUtils.Linear.rotate(
                            [...getIntermediateValues(90, 450, 12), ...getIntermediateValues(450, 450, 12)],
                            defs,
                        ),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(
                                    [...getIntermediateValues(90, 450, 12), ...getIntermediateValues(450, 450, 12)],
                                    180,
                                ),
                                defs,
                            )}
                            ,
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(90, 450, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip3-${id}`,
                    defsElement: (
                        <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(getIntermediateValues(90, 450, 12), 180),
                                defs,
                            )}
                            ,
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snakeWait_3x2s: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                        BorderAnimationUtils.Linear.rotate(
                            [
                                ...getIntermediateValues(90, 270, 12),
                                ...getIntermediateValues(270, 270, 12),
                                ...getIntermediateValues(270, 270, 12),
                                ...getIntermediateValues(270, 450, 12),
                                ...getIntermediateValues(450, 450, 12),
                                ...getIntermediateValues(450, 450, 12),
                            ],
                            defs,
                        ),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(
                                    [
                                        ...getIntermediateValues(90, 270, 12),
                                        ...getIntermediateValues(270, 270, 12),
                                        ...getIntermediateValues(270, 270, 12),
                                        ...getIntermediateValues(270, 450, 12),
                                        ...getIntermediateValues(450, 450, 12),
                                        ...getIntermediateValues(450, 450, 12),
                                    ],
                                    180,
                                ),
                                defs,
                            )}
                            ,
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
                        BorderAnimationUtils.Linear.rotate(
                            [
                                ...getIntermediateValues(90, 270, 12),
                                ...getIntermediateValues(270, 270, 12),
                                ...getIntermediateValues(270, 450, 12),
                                ...getIntermediateValues(450, 450, 12),
                            ],
                            defs,
                        ),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(
                                    [
                                        ...getIntermediateValues(90, 270, 12),
                                        ...getIntermediateValues(270, 270, 12),
                                        ...getIntermediateValues(270, 450, 12),
                                        ...getIntermediateValues(450, 450, 12),
                                    ],
                                    180,
                                ),
                                defs,
                            )}
                            ,
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
                        BorderAnimationUtils.Linear.rotate(getIntermediateValues(90, 450, 12), defs),
                    ),
                },
                clipPath: {
                    id: `clip3-${id}`,
                    defsElement: (
                        <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.Path.getRotatingArc(
                                zip(getIntermediateValues(90, 450, 12), 180),
                                defs,
                            )}
                            ,
                        </clipPath>
                    ),
                },
            },
        ],
    },

    // SWEEP

    sweep_1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                            BorderAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1.25, 1.25], defs),
                    ),
                },
            },
        ],
    },

    sweep_1v1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                            BorderAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1.25, 1.25], defs),
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
                                { value: defs.getColors().secondary, stop: 50 },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)`, stop: 50 },
                            ],
                            angle: 180,
                        },
                        (x1, y1, x2, y2) =>
                            BorderAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [1.25, -1.25], defs),
                    ),
                },
            },
        ],
    },

    sweepDiagonal_1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
            },
        ],
    },

    sweepDiagonal_1v1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
            },
        ],
    },

    sweepDiagonalDesync_4x: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
                            BorderAnimationUtils.Linear.sweepDiagonal(
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
            },
        ],
    },
} as const satisfies Record<string, BorderConfigDefs>;
