import { For } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { SVGGradientDefsUtils } from "../../../../Lib/Abstracts/SVG/Defs/Gradient/SVGGradientDefs.utils";
import type { SVGDefs } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.types";
import type { BorderRadiusDefs, BorderWidthDefs } from "../../../../Lib/Fundamentals/Border/Border.types";
import { BorderUtils } from "../../../../Lib/Fundamentals/Border/Border.utils";

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

/////

const TraversalClipSegment = (props: {
    segmentKey: BorderUtils.BorderTraversalKey;
    isReversed: boolean;
    size: Size2d;
    borderWidths: BorderWidthDefs;
    borderRadii: BorderRadiusDefs;
    visibilityMask: {
        keyTimes: number[];
        values: number[];
    };
    duration: string;
}) => {
    const { segmentKey, isReversed, size, borderWidths, borderRadii, visibilityMask, duration } = props;

    const fmt = (value: number) => Number(value.toFixed(4)).toString();
    const toSvgValues = (values: number[]) => values.map(fmt).join(";");

    const keyTimes = toSvgValues(visibilityMask.keyTimes);

    const getCoverageRange = (value: number) => (value >= 0 ? { start: 0, end: value } : { start: -value, end: 1 });

    const applyDirection = (range: { start: number; end: number }) => {
        if (!isReversed) return range;

        return {
            start: 1 - range.end,
            end: 1 - range.start,
        };
    };

    const ranges = visibilityMask.values.map((value) => applyDirection(getCoverageRange(value)));

    const animate = (attributeName: string, values: number[]) => (
        <animate
            attributeName={attributeName}
            values={toSvgValues(values)}
            keyTimes={keyTimes}
            dur={duration}
            repeatCount="indefinite"
        />
    );

    const animateTransformRotate = (values: number[], cx: number, cy: number) => (
        <animateTransform
            attributeName="transform"
            type="rotate"
            values={values.map((angle) => `${fmt(angle)} ${fmt(cx)} ${fmt(cy)}`).join(";")}
            keyTimes={keyTimes}
            dur={duration}
            repeatCount="indefinite"
        />
    );

    const w = size.width;
    const h = size.height;

    const tl = borderRadii.borderTopLeftRadius;
    const tr = borderRadii.borderTopRightRadius;
    const br = borderRadii.borderBottomRightRadius;
    const bl = borderRadii.borderBottomLeftRadius;

    const topH = Math.max(borderWidths.borderTopWidth, tl, tr);
    const rightW = Math.max(borderWidths.borderRightWidth, tr, br);
    const bottomH = Math.max(borderWidths.borderBottomWidth, bl, br);
    const leftW = Math.max(borderWidths.borderLeftWidth, tl, bl);

    const getLinearValues = (from: number, to: number, axis: "x" | "y") => {
        const pos = ranges.map(({ start, end }) => from + (to - from) * Math.min(start, end));
        const size = ranges.map(({ start, end }) => Math.abs((to - from) * (end - start)));

        return axis === "x" ? { x: pos, width: size, y: [], height: [] } : { x: [], width: [], y: pos, height: size };
    };

    const getCornerPath = (cx: number, cy: number, r: number) => `
        M ${cx} ${cy}
        L ${cx + r} ${cy}
        A ${r} ${r} 0 0 1 ${cx} ${cy + r}
        Z
    `;

    const getCornerRotationValues = (baseAngle: number) =>
        visibilityMask.values.map((value) => {
            const directedValue = isReversed ? -value : value;

            return directedValue >= 0 ? baseAngle - 90 + directedValue * 90 : baseAngle + 90 + -directedValue * 90;
        });

    const renderCorner = (cx: number, cy: number, r: number, baseAngle: number) => {
        if (r <= 0) return null;

        return (
            <path d={getCornerPath(cx, cy, r)}>
                {animateTransformRotate(getCornerRotationValues(baseAngle), cx, cy)}
            </path>
        );
    };

    switch (segmentKey) {
        case "topCenterLeft": {
            const values = getLinearValues(w * 0.5, tl, "x");

            return (
                <rect x={w * 0.5} y="0" width="0" height={topH}>
                    {animate("x", values.x)}
                    {animate("width", values.width)}
                </rect>
            );
        }

        case "topCenterRight": {
            const values = getLinearValues(w * 0.5, w - tr, "x");

            return (
                <rect x={w * 0.5} y="0" width="0" height={topH}>
                    {animate("x", values.x)}
                    {animate("width", values.width)}
                </rect>
            );
        }

        case "rightCenterTop": {
            const values = getLinearValues(h * 0.5, tr, "y");

            return (
                <rect x={w - rightW} y={h * 0.5} width={rightW} height="0">
                    {animate("y", values.y)}
                    {animate("height", values.height)}
                </rect>
            );
        }

        case "rightCenterBottom": {
            const values = getLinearValues(h * 0.5, h - br, "y");

            return (
                <rect x={w - rightW} y={h * 0.5} width={rightW} height="0">
                    {animate("y", values.y)}
                    {animate("height", values.height)}
                </rect>
            );
        }

        case "bottomCenterRight": {
            const values = getLinearValues(w * 0.5, w - br, "x");

            return (
                <rect x={w * 0.5} y={h - bottomH} width="0" height={bottomH}>
                    {animate("x", values.x)}
                    {animate("width", values.width)}
                </rect>
            );
        }

        case "bottomCenterLeft": {
            const values = getLinearValues(w * 0.5, bl, "x");

            return (
                <rect x={w * 0.5} y={h - bottomH} width="0" height={bottomH}>
                    {animate("x", values.x)}
                    {animate("width", values.width)}
                </rect>
            );
        }

        case "leftCenterBottom": {
            const values = getLinearValues(h * 0.5, h - bl, "y");

            return (
                <rect x="0" y={h * 0.5} width={leftW} height="0">
                    {animate("y", values.y)}
                    {animate("height", values.height)}
                </rect>
            );
        }

        case "leftCenterTop": {
            const values = getLinearValues(h * 0.5, tl, "y");

            return (
                <rect x="0" y={h * 0.5} width={leftW} height="0">
                    {animate("y", values.y)}
                    {animate("height", values.height)}
                </rect>
            );
        }

        case "topRight":
            return renderCorner(w - tr, tr, tr, 0);

        case "bottomRight":
            return renderCorner(w - br, h - br, br, 90);

        case "bottomLeft":
            return renderCorner(bl, h - bl, bl, 180);

        case "topLeft":
            return renderCorner(tl, tl, tl, 270);
    }
};

/////

const getTraversalClipPath = (
    id: string,
    paths: {
        from: BorderUtils.BorderTraversalKey;
        to: BorderUtils.BorderTraversalKey;
        dir: BorderUtils.BorderTraversalDirection;
    }[],
    getSize: () => Size2d,
    getBorderWidths: () => BorderWidthDefs,
    getBorderRadii: () => BorderRadiusDefs,
    opts: {
        durationMs: number;
        visibilityMode: BorderUtils.BorderTraversalVisibilityMode;
    },
) => {
    const size = getSize();
    const borderWidths = getBorderWidths();
    const borderRadii = getBorderRadii();
    const traversalLengths = BorderUtils.getBorderTraversalLengths(size, borderRadii);
    const duration = `${opts.durationMs}ms`;

    const getPathVisibilityMask = (path: BorderUtils.BorderTraversalKey[], idx: number) => {
        const keyTimes = BorderUtils.getBorderTraversalKeyTimes(path, traversalLengths, opts.visibilityMode);
        const visibilityMask = BorderUtils.getBorderTraversalVisibilityMask(idx, keyTimes, opts.visibilityMode);

        return visibilityMask;
    };

    return (
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
            <For each={paths.flat()}>
                {(defs) => {
                    const path = BorderUtils.getBorderTraversalPath(defs);

                    return path.map((key, segmentIdx) => {
                        const visibilityMask = getPathVisibilityMask(path, segmentIdx);

                        if (!visibilityMask.keyTimes || !visibilityMask.values) return null;

                        return (
                            <TraversalClipSegment
                                segmentKey={key}
                                isReversed={defs.dir === "counterclockwise"}
                                size={size}
                                borderWidths={borderWidths}
                                borderRadii={borderRadii}
                                visibilityMask={visibilityMask}
                                duration={duration}
                            />
                        );
                    });
                }}
            </For>
        </clipPath>
    );
};

/////

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
    /*
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
                    defsElement: getTraversalClipPath(
                        `clip1-${id}`,
                        [
                            {
                                dir: "clockwise",
                                from: "topCenterRight",
                                to: "bottomCenterRight",
                            },
                            {
                                dir: "counterclockwise",
                                from: "topCenterLeft",
                                to: "bottomCenterLeft",
                            },
                        ],
                        getSize,
                        getBorderWidths,
                        getBorderRadii,
                        {
                            durationMs: 10000,
                            visibilityMode: "transient",
                        },
                    ),
                },
            },
        ],
    },
    */
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
