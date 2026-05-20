import type { Size2d } from "@thewaver/ss-utils";

import { SVGGradientDefsUtils } from "../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { SVGDefs } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.types";
import type { BorderRadiusDefs, BorderWidthDefs } from "../../../../Lib/Fundamentals/Border/Border.types";

import * as styles from "./BorderPage.css";

export type BorderDefs = {
    class: string;
    getFillDefs: (
        id: string,
        getSize: () => Size2d,
        getBorderWidths: () => BorderWidthDefs,
        getBorderRadii: () => BorderRadiusDefs,
    ) => SVGDefs[];
};

export const BORDER_CONFIGS = {
    plain: {
        class: styles.borderedContainer,
        getFillDefs: () => [
            {
                color: "#FF00FF",
            },
        ],
    },

    counterOrbit: {
        class: styles.borderedContainer,
        getFillDefs: (id) => [
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [{ value: "#FF00FF" }, { value: "#00FFFF" }],
                        },
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur="5s"
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
                            colors: [{ value: "#FFFF0000" }, { value: "#FFFF00" }],
                        },
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="360 0.5 0.5"
                            to="0 0.5 0.5"
                            dur="2.5s"
                            repeatCount="indefinite"
                        />,
                    ),
                },
            },
        ],
    },

    dualOrbit: {
        class: styles.borderedContainer,
        getFillDefs: (id) => [
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [{ value: "#FF00FF" }, { value: "#FFFF00" }, { value: "#FF00FF" }],
                        },
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur="2.5s"
                            repeatCount="indefinite"
                        />,
                    ),
                },
            },
        ],
    },

    multiOrbit: {
        class: styles.borderedContainer,
        getFillDefs: (id) => [
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient1-${id}`,
                            colors: [{ value: "#00FFFF00" }, { value: "#00FFFF" }, { value: "#00FFFF00" }],
                        },
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur="1.25s"
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
                            colors: [{ value: "#FFFF0000" }, { value: "#FFFF00" }, { value: "#FFFF0000" }],
                        },
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur="2.5s"
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
                            colors: [{ value: "#FF00FF00" }, { value: "#FF00FF" }, { value: "#FF00FF00" }],
                        },
                        <animateTransform
                            attributeName="gradientTransform"
                            type="rotate"
                            from="0 0.5 0.5"
                            to="360 0.5 0.5"
                            dur="5s"
                            repeatCount="indefinite"
                        />,
                    ),
                },
                blend: true,
            },
        ],
    },

    drip: {
        class: styles.borderedContainer,
        getFillDefs: (id, getSize, getBorderWidths, getBorderRadii) => [
            {
                gradient: {
                    id: `gradient1-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient({
                        id: `gradient1-${id}`,
                        colors: [{ value: "#FF00FF" }, { value: "#00FFFF" }],
                        angle: 90,
                    }),
                },
            },
            {
                gradient: {
                    id: `gradient2-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient({
                        id: `gradient2-${id}`,
                        colors: [{ value: "#FFFF00" }, { value: "#FFFFFF" }],
                        angle: 90,
                    }),
                },
                clipPath: {
                    id: `clip1-${id}`,
                    defsElement: (
                        <clipPath id={`clip1-${id}`} clipPathUnits="userSpaceOnUse">
                            <rect
                                x={getSize().width * 0.5}
                                y="0"
                                width="0"
                                height={Math.max(
                                    getBorderWidths().borderTopWidth,
                                    getBorderRadii().borderTopLeftRadius,
                                    getBorderRadii().borderTopRightRadius,
                                )}
                            >
                                <animate
                                    attributeName="x"
                                    values="50%;0;0;0;0"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />

                                <animate
                                    attributeName="width"
                                    values="0;50%;0;0;0"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />
                            </rect>

                            <rect
                                x={getSize().width * 0.5}
                                y="0"
                                width="0"
                                height={Math.max(
                                    getBorderWidths().borderTopWidth,
                                    getBorderRadii().borderTopLeftRadius,
                                    getBorderRadii().borderTopRightRadius,
                                )}
                            >
                                <animate
                                    attributeName="x"
                                    values="50%;50%;100%;100%;100%"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />

                                <animate
                                    attributeName="width"
                                    values="0;50%;0;0;0"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />
                            </rect>

                            <rect
                                x="0"
                                y="0"
                                width={Math.max(
                                    getBorderWidths().borderLeftWidth,
                                    getBorderRadii().borderTopLeftRadius,
                                    getBorderRadii().borderBottomLeftRadius,
                                )}
                                height="0"
                            >
                                <animate
                                    attributeName="y"
                                    values="0;0;0;100%;100%"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />

                                <animate
                                    attributeName="height"
                                    values={`0;0;100%;0;0`}
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />
                            </rect>

                            <rect
                                x={
                                    getSize().width -
                                    Math.max(
                                        getBorderWidths().borderRightWidth,
                                        getBorderRadii().borderTopRightRadius,
                                        getBorderRadii().borderBottomRightRadius,
                                    )
                                }
                                y="0"
                                width={Math.max(
                                    getBorderWidths().borderRightWidth,
                                    getBorderRadii().borderTopRightRadius,
                                    getBorderRadii().borderBottomRightRadius,
                                )}
                                height="0"
                            >
                                <animate
                                    attributeName="y"
                                    values="0;0;0;100%;100%"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />

                                <animate
                                    attributeName="height"
                                    values={`0;0;100%;0;0`}
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />
                            </rect>

                            <rect
                                x={getSize().width * 0.5}
                                y={
                                    getSize().height -
                                    Math.max(
                                        getBorderWidths().borderBottomWidth,
                                        getBorderRadii().borderBottomLeftRadius,
                                        getBorderRadii().borderBottomRightRadius,
                                    )
                                }
                                width="0"
                                height={Math.max(
                                    getBorderWidths().borderBottomWidth,
                                    getBorderRadii().borderBottomLeftRadius,
                                    getBorderRadii().borderBottomRightRadius,
                                )}
                            >
                                <animate
                                    attributeName="x"
                                    values="0;0;0;0;50%"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />

                                <animate
                                    attributeName="width"
                                    values="0;0;0;50%;0"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />
                            </rect>

                            <rect
                                x={getSize().width * 0.5}
                                y={
                                    getSize().height -
                                    Math.max(
                                        getBorderWidths().borderBottomWidth,
                                        getBorderRadii().borderBottomLeftRadius,
                                        getBorderRadii().borderBottomRightRadius,
                                    )
                                }
                                width="0"
                                height={Math.max(
                                    getBorderWidths().borderBottomWidth,
                                    getBorderRadii().borderBottomLeftRadius,
                                    getBorderRadii().borderBottomRightRadius,
                                )}
                            >
                                <animate
                                    attributeName="x"
                                    values="100%;100%;100%;50%;50%"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />

                                <animate
                                    attributeName="width"
                                    values={`0;0;0;50%;0`}
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />
                            </rect>
                        </clipPath>
                    ),
                },
            },
        ],
    },

    scan: {
        class: styles.borderedContainer,
        getFillDefs: (id) => [
            {
                gradient: {
                    id: `gradient-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient-${id}`,
                            colors: [{ value: "#FF00FF" }, { value: "#FFFF00" }, { value: "#FF00FF" }],
                        },
                        <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            values="-1 0;1 0;-1 0"
                            dur="5s"
                            repeatCount="indefinite"
                        />,
                    ),
                },
            },
        ],
    },

    sweepDiagonal: {
        class: styles.borderedContainer,
        getFillDefs: (id) => [
            {
                gradient: {
                    id: `gradient-${id}`,
                    defsElement: SVGGradientDefsUtils.getLinearGradient(
                        {
                            id: `gradient-${id}`,
                            colors: [
                                { value: "#FF00FF" },
                                { value: "#FFFF00", stop: 50 },
                                { value: "#FF00FF", stop: 50 },
                            ],
                            angle: 45,
                        },
                        <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            values="-1 -1;1 1"
                            dur="2.5s"
                            repeatCount="indefinite"
                        />,
                    ),
                },
            },
        ],
    },
} as const satisfies Record<string, BorderDefs>;
