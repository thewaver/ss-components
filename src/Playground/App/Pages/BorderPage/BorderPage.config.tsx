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

const getCommonAnimDefs = (defs: BorderFillConfigDefs, keyTimes?: string) => ({
    keyTimes,
    dur: `${defs.getAnimationDurationMs()}ms`,
    repeatCount: "indefinite" as const,
});

export namespace BorderAnimationUtils {
    const V_KEYS = ["x1", "y1", "x2", "y2"] as const;

    export const growOrthogonal = (
        vName: "x" | "y",
        v1: number,
        v2: number,
        sArr: number[],
        tArr: number[] | undefined,
        defs: BorderFillConfigDefs,
    ) => {
        const keyTimes = tArr?.length ? tArr.join(";") : undefined;
        const commonDefs = getCommonAnimDefs(defs, keyTimes);
        const halfDist = Math.abs(v2 - v1) * 0.5;

        return (
            <>
                <animate attributeName={`${vName}1`} values={sArr.map((s) => `${v1 + halfDist - halfDist * s}`).join(";")} {...commonDefs} />
                <animate attributeName={`${vName}2`} values={sArr.map((s) => `${v2 - halfDist + halfDist * s}`).join(";")} {...commonDefs} />
            </>
        );
    };
    
    export const sweepOrthogonal = (
        vName: "x" | "y",
        v1: number,
        v2: number,
        oArr: number[],
        tArr: number[] | undefined,
        defs: BorderFillConfigDefs,
    ) => {
        const keyTimes = tArr?.length ? tArr.join(";") : undefined;
        const commonDefs = getCommonAnimDefs(defs, keyTimes);

        return (
            <>
                <animate attributeName={`${vName}1`} values={oArr.map((o) => `${v1 + o}`).join(";")} {...commonDefs} />
                <animate attributeName={`${vName}2`} values={oArr.map((o) => `${v2 + o}`).join(";")} {...commonDefs} />
            </>
        );
    };

    export const sweepDiagonal = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        oArrX: number[],
        oArrY: number[],
        tArr: number[] | undefined,
        defs: BorderFillConfigDefs,
    ) => {
        const points = [
            [x1, y1],
            [x2, y2],
        ];
        const rad = (45 * Math.PI) / 180;
        const keyTimes = tArr?.length ? tArr.join(";") : undefined;
        const commonDefs = getCommonAnimDefs(defs, keyTimes);

        return (
            <For each={points}>
                {(point, getIndex) => {
                    const x = point[0];
                    const y = point[1];

                    return (
                        <>
                            <animate
                                attributeName={`x${getIndex() + 1}`}
                                values={oArrX.map((o) => `${x + o * Math.cos(rad)}`).join(";")}
                                {...commonDefs}
                            />
                            <animate
                                attributeName={`y${getIndex() + 1}`}
                                values={oArrY.map((o) => `${y + o * Math.sin(rad)}`).join(";")}
                                {...commonDefs}
                            />
                        </>
                    );
                }}
            </For>
        );
    };

    export const rotate = (from: number, to: number, stepSize: number = 10, defs: BorderFillConfigDefs) => {
        const steps = Array.from({ length: Math.round(Math.abs(to - from) / stepSize) + 1 }, (_, index) => SVGGradientDefsUtils.getLinearCoords({ angle: from < to ? from + stepSize * index : from - stepSize * index }));
        const commonDefs = getCommonAnimDefs(defs);

        return <For each={V_KEYS}> 
            {(vKey) => <animate
                attributeName={vKey}
                values={steps.map((step) => step[vKey]).join(";")}
                {...commonDefs}
            />}
        </For>
    }
}

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
                        (x1, y1, x2, y2) =>
                            BorderAnimationUtils.sweepOrthogonal("x", x1, x2, [0.5, -0.5], undefined, defs),
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
                            BorderAnimationUtils.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [0.75, -0.75],
                                [0.75, -0.75],
                                undefined,
                                defs,
                            ),
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
                        (x1, y1, x2, y2) =>
                            BorderAnimationUtils.sweepOrthogonal("x", x1, x2, [1, -1, 1], undefined, defs),
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
                        (x1, y1, x2, y2) =>
                            BorderAnimationUtils.sweepOrthogonal("x", x1, x2, [-1, 1, -1], undefined, defs),
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
                        (x1, y1, x2, y2) =>
                            BorderAnimationUtils.sweepOrthogonal("x", x1, x2, [-1, 1, -1], undefined, defs),
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
                            BorderAnimationUtils.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [-1.25, 1.25],
                                [-1.25, 1.25],
                                undefined,
                                defs,
                            ),
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
                        (x1, y1, x2, y2) =>
                            BorderAnimationUtils.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [-1.25, 1.25],
                                [-1.25, 1.25],
                                undefined,
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
                                [1.25, -1.25],
                                [1.25, -1.25],
                                undefined,
                                defs,
                            ),
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
                        (x1, y1, x2, y2) =>
                            BorderAnimationUtils.sweepDiagonal(
                                x1,
                                y1,
                                x2,
                                y2,
                                [-1.25, 0, 1.25, 1.25, 1.25, 1.25],
                                [-1.25, 0, 1.25, 1.25, 1.25, 1.25],
                                undefined,
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
                                undefined,
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
                                undefined,
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
                                undefined,
                                defs,
                            ),
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
                        <animate attributeName="r" values={"0;2;0"} {...getCommonAnimDefs(defs)} />,
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
                        <animate attributeName="r" values={"0;2;0"} {...getCommonAnimDefs(defs)} />,
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
                        <animate attributeName="r" values={"0;2;0"} {...getCommonAnimDefs(defs)} />,
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
                        <animate attributeName="r" values={"0;2;0"} {...getCommonAnimDefs(defs)} />,
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
                        (x1, y1, x2, y2) => BorderAnimationUtils.growOrthogonal("x", x1, x2, [0, 4, 0], undefined, defs),
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
                        (x1, y1, x2, y2) => BorderAnimationUtils.growOrthogonal("x", x1, x2, [0, 2, 0], undefined, defs),
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
                                { value: defs.getColors().secondary },
                                { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                            ],
                            angle: 135,
                        },
                        (x1, y1, x2, y2) => BorderAnimationUtils.growOrthogonal("y", y1, y2, [0, 2, 0], undefined, defs),
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
                            ],
                        },
                        BorderAnimationUtils.rotate(0, 360, undefined, defs),
                    ),
                },
                /*clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                {BorderAnimationUtils.rotate(0, 360, undefined, defs)},
                            </path>
                        </clipPath>
                    ),
                },*/
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
                        BorderAnimationUtils.rotate(0, 360, undefined, defs),
                    ),
                },
                /*clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                {BorderAnimationUtils.rotate(0, 360, undefined, defs)}
                            </path>
                        </clipPath>
                    ),
                },*/
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
                        BorderAnimationUtils.rotate(360, 0, undefined, defs),
                    ),
                },
                /*clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                {BorderAnimationUtils.rotate(360, 0, undefined, defs)}
                            </path>
                        </clipPath>
                    ),
                },*/
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
                        BorderAnimationUtils.rotate(0, 360, undefined, defs),
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
                        BorderAnimationUtils.rotate(0, 360, undefined, defs),
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
                        BorderAnimationUtils.rotate(360, 0, undefined, defs),
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
                        BorderAnimationUtils.rotate(0, 360, undefined, defs),
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
                        BorderAnimationUtils.rotate(360, 0, undefined, defs),
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
                        BorderAnimationUtils.rotate(0, 360, undefined, ({ ...defs, getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5 })),
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
                        BorderAnimationUtils.rotate(0, 360, undefined, defs),
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
                        BorderAnimationUtils.rotate(0, 360, undefined, ({ ...defs, getAnimationDurationMs: () => defs.getAnimationDurationMs() * 2 })),
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
                        BorderAnimationUtils.rotate(0, 360, undefined, defs),
                    ),
                },
                /*clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                {BorderAnimationUtils.rotate(0, 360, undefined, defs)}
                            </path>
                        </clipPath>
                    ),
                },*/
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
                        BorderAnimationUtils.rotate(90, 450, undefined, defs),
                    ),
                },
                /*clipPath: {
                    id: `clip2-${id}`,
                    defsElement: (
                        <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                {BorderAnimationUtils.rotate(90, 450, undefined, defs)}
                            </path>
                        </clipPath>
                    ),
                },*/
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
                        BorderAnimationUtils.rotate(180, 540, undefined, defs),
                    ),
                },
                /*clipPath: {
                    id: `clip3-${id}`,
                    defsElement: (
                        <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                {BorderAnimationUtils.rotate(180, 540, undefined, defs)}
                            </path>
                        </clipPath>
                    ),
                },*/
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
                        BorderAnimationUtils.rotate(270, 630, undefined, defs),
                    ),
                },
                /*clipPath: {
                    id: `clip4-${id}`,
                    defsElement: (
                        <clipPath id={`clip4-${id}`} clipPathUnits="objectBoundingBox">
                            <path d={`M -0.5 0.5 A 1 1 0 0 1 1.5 0.5`}>
                                {BorderAnimationUtils.rotate(270, 630, undefined, defs)}
                            </path>
                        </clipPath>
                    ),
                },*/
            },
        ],
    },
} as const satisfies Record<string, BorderConfigDefs>;
