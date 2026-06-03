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

    flow1: {
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
                        (x1, y1, x2, y2) => BorderAnimationUtils.sweepOrthogonal("x", x1, x2, [0.5, -0.5], defs),
                    ),
                },
            },
        ],
    },

    flowDiagonal1: {
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
                            BorderAnimationUtils.sweepDiagonal(x1, y1, x2, y2, [0.75, -0.75], [0.75, -0.75], defs),
                    ),
                },
            },
        ],
    },

    clam1v1: {
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
                        (x1, y1, x2, y2) => BorderAnimationUtils.sweepOrthogonal("x", x1, x2, [1, -1, 1], defs),
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
                            ],
                            angle: 180,
                        },
                        (x1, y1, x2, y2) => BorderAnimationUtils.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
                    ),
                },
                blend: true,
            },
        ],
    },

    scan1: {
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
                        (x1, y1, x2, y2) => BorderAnimationUtils.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
                    ),
                },
            },
        ],
    },

    sweepDiagonal1: {
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
                            BorderAnimationUtils.sweepDiagonal(x1, y1, x2, y2, [-1.25, 1.25], [-1.25, 1.25], defs),
                    ),
                },
            },
        ],
    },

    sweepDiagonal1v1: {
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
                            BorderAnimationUtils.sweepDiagonal(x1, y1, x2, y2, [-1.25, 1.25], [-1.25, 1.25], defs),
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
                            BorderAnimationUtils.sweepDiagonal(x1, y1, x2, y2, [1.25, -1.25], [1.25, -1.25], defs),
                    ),
                },
            },
        ],
    },

    sweepDiagonal1v1v1v1: {
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
                            BorderAnimationUtils.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [-1.25, 0, 1.25, 1.25, 1.25, 1.25],
                                [-1.25, 0, 1.25, 1.25, 1.25, 1.25],
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
                            BorderAnimationUtils.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [1.25, 1.25, 0, -1.25, -1.25, -1.25],
                                [1.25, 1.25, 0, -1.25, -1.25, -1.25],
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
                            BorderAnimationUtils.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [1.25, 1.25, 1.25, 0, -1.25, -1.25],
                                [-1.25, -1.25, -1.25, 0, 1.25, 1.25],
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
                            BorderAnimationUtils.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [-1.25, -1.25, -1.25, -1.25, 0, 1.25],
                                [1.25, 1.25, 1.25, 1.25, 0, -1.25],
                                defs,
                            ),
                    ),
                },
            },
        ],
    },

    corny1v1v1v1: {
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
                        BorderAnimationUtils.growRadial([0, 1, 1, 1, 1, 0, 0, 0, 0], defs),
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
                        BorderAnimationUtils.growRadial([0, 0, 1, 1, 1, 1, 0, 0, 0], defs),
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
                        BorderAnimationUtils.growRadial([0, 0, 0, 1, 1, 1, 1, 0, 0], defs),
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
                        BorderAnimationUtils.growRadial([0, 0, 0, 0, 1, 1, 1, 1, 0], defs),
                    ),
                },
            },
        ],
    },

    flood2: {
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
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                        },
                        (x1, y1, x2, y2) => BorderAnimationUtils.growOrthogonal("x", x1, x2, [0, 4, 0], defs),
                    ),
                },
            },
        ],
    },

    snake1: {
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
                        BorderAnimationUtils.rotate(0, 360, defs),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.getRotatingArc(0, 360, defs)},
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snake1v1: {
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
                        BorderAnimationUtils.rotate(0, 360, defs),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.getRotatingArc(0, 360, defs)},
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
                        BorderAnimationUtils.rotate(360, 0, defs),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.getRotatingArc(360, 0, defs)},
                        </clipPath>
                    ),
                },
            },
        ],
    },

    snake4: {
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
                        BorderAnimationUtils.rotate(0, 360, defs),
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.getRotatingArc(0, 360, defs)},
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
                        BorderAnimationUtils.rotate(90, 450, defs),
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.getRotatingArc(90, 450, defs)},
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
                        BorderAnimationUtils.rotate(180, 540, defs),
                    ),
                },
                clipPath: {
                    id: `clip3-${id}`,
                    defsElement: (
                        <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.getRotatingArc(180, 540, defs)},
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
                        BorderAnimationUtils.rotate(270, 630, defs),
                    ),
                },
                clipPath: {
                    id: `clip4-${id}`,
                    defsElement: (
                        <clipPath id={`clip4-${id}`} clipPathUnits="objectBoundingBox">
                            {BorderAnimationUtils.getRotatingArc(270, 630, defs)},
                        </clipPath>
                    ),
                },
            },
        ],
    },

    orbit1: {
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
                        BorderAnimationUtils.rotate(0, 360, defs),
                    ),
                },
            },
        ],
    },

    orbit1v1: {
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
                        BorderAnimationUtils.rotate(0, 360, defs),
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
                        BorderAnimationUtils.rotate(360, 0, defs),
                    ),
                },
            },
        ],
    },

    orbit2v1: {
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
                        BorderAnimationUtils.rotate(0, 360, defs),
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
                        BorderAnimationUtils.rotate(360, 0, defs),
                    ),
                },
            },
        ],
    },

    orbit3: {
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
                        BorderAnimationUtils.rotate(0, 360, {
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
                        BorderAnimationUtils.rotate(0, 360, defs),
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
                        BorderAnimationUtils.rotate(0, 360, {
                            ...defs,
                            getAnimationDurationMs: () => defs.getAnimationDurationMs() * 2,
                        }),
                    ),
                },
                blend: true,
            },
        ],
    },
} as const satisfies Record<string, BorderConfigDefs>;
