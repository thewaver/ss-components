import type { Size2d } from "@thewaver/ss-utils";

import { SVGGradientDefsUtils } from "../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { SVGDefs } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.types";
import type { BorderRadiusDefs, BorderWidthDefs } from "../../../../Lib/Fundamentals/Border/Border.types";
import type { BorderConfigColors } from "./BorderPage.types";

import * as styles from "./BorderPage.css";

export type BorderConfigDefs = {
    class: string;
    getFillDefs: (
        id: string,
        defs: {
            getSize: () => Size2d;
            getBorderWidths: () => BorderWidthDefs;
            getBorderRadii: () => BorderRadiusDefs;
            getAnimationDurationMs: () => number;
            getColors: () => BorderConfigColors;
        },
    ) => SVGDefs[];
};

const getBaseBorderColor = (color: string) => `hsl(from ${color} h s calc(l * 2))`;

export const BORDER_CONFIGS = {
    plain: {
        class: styles.borderedContainer,
        getFillDefs: (_, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                        },
                        <>
                            {" "}
                            <animateTransform
                                attributeName="gradientTransform"
                                type="scale"
                                values="2 2;2 2"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                            <animateTransform
                                attributeName="gradientTransform"
                                type="translate"
                                values="0 0;-0.5 0"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                        </>,
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
                        },
                        <>
                            <animateTransform
                                attributeName="gradientTransform"
                                type="scale"
                                values="3 3;3 3"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                            <animateTransform
                                attributeName="gradientTransform"
                                type="translate"
                                values={((rad) =>
                                    `${-0.166 * Math.cos(rad)} ${-0.166 * Math.sin(rad)};${-0.666 * Math.cos(rad)} ${-0.666 * Math.sin(rad)}`)(
                                    (45 * Math.PI) / 180,
                                )}
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                        </>,
                    ),
                },
            },
        ],
    },

    clam1v1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            values="1 0;-1 0;1 0"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            values="-1 0;1 0;-1 0"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
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
                color: getBaseBorderColor(defs.getColors().background),
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            values="-1 0;1 0;-1 0"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
            },
        ],
    },

    sweepDiagonal1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            values="-1 -1;1 1"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
            },
        ],
    },

    sweepDiagonal2: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            values="-1 -1;1 1"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            values="1 1;-1 -1"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
            },
        ],
    },

    sweepDiagonal4: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            values="-1 -1;0 0;1 1;1 1;1 1;1 1"
                            keyTimes="0;0.2;0.4;0.6;0.8;1"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            values="1 1;1 1;0 0;-1 -1;-1 -1;-1 -1"
                            keyTimes="0;0.2;0.4;0.6;0.8;1"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            values="1 -1;1 -1;1 -1;0 0;-1 1;-1 1"
                            keyTimes="0;0.2;0.4;0.6;0.8;1"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            values="-1 1;-1 1;-1 1;-1 1;0 0;1 -1"
                            keyTimes="0;0.2;0.4;0.6;0.8;1"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
            },
        ],
    },

    corny4: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                        <>
                            <animateTransform
                                attributeName="gradientTransform"
                                type="translate"
                                values="0 0;0 0;0 0"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                            <animateTransform
                                attributeName="gradientTransform"
                                type="scale"
                                values="0 0;2 2;0 0"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                        </>,
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
                            origin: { x: 100, y: 0 },
                        },
                        <>
                            <animateTransform
                                attributeName="gradientTransform"
                                type="translate"
                                values="1 0;-1 0;1 0"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                            <animateTransform
                                attributeName="gradientTransform"
                                type="scale"
                                values="0 0;2 2;0 0"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                        </>,
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
                            origin: { x: 100, y: 100 },
                        },
                        <>
                            <animateTransform
                                attributeName="gradientTransform"
                                type="translate"
                                values="1 1;-1 -1;1 1"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                            <animateTransform
                                attributeName="gradientTransform"
                                type="scale"
                                values="0 0;2 2;0 0"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                        </>,
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
                            origin: { x: 0, y: 100 },
                        },
                        <>
                            <animateTransform
                                attributeName="gradientTransform"
                                type="translate"
                                values="0 1;0 -1;0 1"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                            <animateTransform
                                attributeName="gradientTransform"
                                type="scale"
                                values="0 0;2 2;0 0"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                        </>,
                    ),
                },
            },
        ],
    },

    flood1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                        <>
                            <animateTransform
                                attributeName="gradientTransform"
                                type="translate"
                                values="0.5 0;-1.5 0;0.5 0"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                            <animateTransform
                                attributeName="gradientTransform"
                                type="scale"
                                values="0 1;4 1;0 1"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                        </>,
                    ),
                },
            },
        ],
    },

    flood1v1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                            angle: 45,
                        },
                        <>
                            <animateTransform
                                attributeName="gradientTransform"
                                type="translate"
                                values="0.5 0;-1.5 0;0.5 0"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                            <animateTransform
                                attributeName="gradientTransform"
                                type="scale"
                                values="0 1;4 1;0 1"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                            <animateTransform
                                attributeName="gradientTransform"
                                type="rotate"
                                from="0 0.5 0.5"
                                to="360 0.5 0.5"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                        </>,
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
                                { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                { value: defs.getColors().primary },
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                            angle: 135,
                        },
                        <>
                            <animateTransform
                                attributeName="gradientTransform"
                                type="translate"
                                values="0 0.5;0 -1.5;0 0.5"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                            <animateTransform
                                attributeName="gradientTransform"
                                type="scale"
                                values="1 0;1 4;1 0"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                            <animateTransform
                                attributeName="gradientTransform"
                                type="rotate"
                                from="0 0.5 0.5"
                                to="360 0.5 0.5"
                                dur={`${defs.getAnimationDurationMs()}ms`}
                                additive="sum"
                                repeatCount="indefinite"
                            />
                        </>,
                    ),
                },
                blend: true,
            },
        ],
    },

    orbit1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0 0.5 0.5"
                                    to="360 0.5 0.5"
                                    dur={`${defs.getAnimationDurationMs()}ms`}
                                    repeatCount="indefinite"
                                />
                            </path>
                        </clipPath>
                    ),
                },
            },
        ],
    },

    orbit1v1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0 0.5 0.5"
                                    to="360 0.5 0.5"
                                    dur={`${defs.getAnimationDurationMs()}ms`}
                                    repeatCount="indefinite"
                                />
                            </path>
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="360 0.5 0.5"
                            to="0 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="360 0.5 0.5"
                                    to="0 0.5 0.5"
                                    dur={`${defs.getAnimationDurationMs()}ms`}
                                    repeatCount="indefinite"
                                />
                            </path>
                        </clipPath>
                    ),
                },
            },
        ],
    },

    orbit2: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
            },
        ],
    },

    orbit2v1: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
            },
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                { value: defs.getColors().secondary },
                            ],
                        },
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs() * 2}ms`}
                            repeatCount="indefinite"
                        />,
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="360 0.5 0.5"
                            to="0 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
            },
        ],
    },

    orbit2v2: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="360 0.5 0.5"
                            to="0 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
            },
        ],
    },

    orbit3: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs() * 0.5}ms`}
                            repeatCount="indefinite"
                        />,
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs() * 2}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
                blend: true,
            },
        ],
    },

    orbit4: {
        class: styles.borderedContainer,
        getFillDefs: (id, defs) => [
            {
                color: getBaseBorderColor(defs.getColors().background),
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0 0.5 0.5"
                                    to="360 0.5 0.5"
                                    dur={`${defs.getAnimationDurationMs()}ms`}
                                    repeatCount="indefinite"
                                />
                            </path>
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="90 0.5 0.5"
                            to="450 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
                clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="90 0.5 0.5"
                                    to="450 0.5 0.5"
                                    dur={`${defs.getAnimationDurationMs()}ms`}
                                    repeatCount="indefinite"
                                />
                            </path>
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="180 0.5 0.5"
                            to="540 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
                clipPath: {
                    id: `clip3-${id}`,
                    defsElement: (
                        <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="180 0.5 0.5"
                                    to="540 0.5 0.5"
                                    dur={`${defs.getAnimationDurationMs()}ms`}
                                    repeatCount="indefinite"
                                />
                            </path>
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
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="270 0.5 0.5"
                            to="630 0.5 0.5"
                            dur={`${defs.getAnimationDurationMs()}ms`}
                            repeatCount="indefinite"
                        />,
                    ),
                },
                clipPath: {
                    id: `clip4-${id}`,
                    defsElement: (
                        <clipPath id={`clip4-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="270 0.5 0.5"
                                    to="630 0.5 0.5"
                                    dur={`${defs.getAnimationDurationMs()}ms`}
                                    repeatCount="indefinite"
                                />
                            </path>
                        </clipPath>
                    ),
                },
            },
        ],
    },
} as const satisfies Record<string, BorderConfigDefs>;
