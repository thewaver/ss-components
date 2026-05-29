import { For } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { SVGGradientDefsUtils } from "../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { SVGDefs } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.types";
import type { BorderRadiusDefs, BorderWidthDefs } from "../../../../Lib/Fundamentals/Border/Border.types";
import type { BorderConfigColors } from "./BorderPage.types";

import * as styles from "./BorderPage.css";

export type BorderFillConfigDefs = {
    getSize: () => Size2d;
    getBorderWidths: () => BorderWidthDefs;
    getBorderRadii: () => BorderRadiusDefs;
    getAnimationDurationMs: () => number;
    getColors: () => BorderConfigColors;
};

export type BorderConfigDefs = {
    class: string;
    getFillDefs: (id: string, defs: BorderFillConfigDefs) => SVGDefs[];
};

const getBaseBorderColor = (defs: BorderFillConfigDefs) => `hsl(from ${defs.getColors().background} h s calc(l * 2))`;

const getCommonAnimDefs = (defs: BorderFillConfigDefs) => ({
    dur: `${defs.getAnimationDurationMs()}ms`,
    repeatCount: "indefinite" as const,
});

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
                        (x1, y1, x2, y2) => {
                            const commonDefs = getCommonAnimDefs(defs);

                            return (
                                <>
                                    <animate attributeName="x1" values={`${x1 + 0.5};${x1 - 0.5}`} {...commonDefs} />
                                    <animate attributeName="x2" values={`${x2 + 0.5};${x2 - 0.5}`} {...commonDefs} />
                                </>
                            );
                        },
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
                        (...params) => {
                            const rad = (45 * Math.PI) / 180;
                            const commonDefs = getCommonAnimDefs(defs);

                            return (
                                <For each={Array.from({ length: params.length * 0.5 }, (_, idx) => idx)}>
                                    {(itemIndex) => {
                                        const x = params[0 + itemIndex * 2];
                                        const y = params[1 + itemIndex * 2];

                                        return (
                                            <>
                                                <animate
                                                    attributeName={`x${itemIndex + 1}`}
                                                    values={`${x + 0.75 * Math.cos(rad)};${x - 0.75 * Math.cos(rad)}`}
                                                    {...commonDefs}
                                                />
                                                <animate
                                                    attributeName={`y${itemIndex + 1}`}
                                                    values={`${y + 0.75 * Math.sin(rad)};${y - 0.75 * Math.sin(rad)}`}
                                                    {...commonDefs}
                                                />
                                            </>
                                        );
                                    }}
                                </For>
                            );
                        },
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
