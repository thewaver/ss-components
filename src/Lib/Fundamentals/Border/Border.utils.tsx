import { For } from "solid-js";

import type { Point2d, Size2d } from "@thewaver/ss-utils";

import { SVGUtils } from "../../Abstracts/SVG/SVG.utils";
import type { BorderRadiusDefs, BorderWidthDefs } from "./Border.types";

export namespace BorderUtils {
    export const spreadRadius = (radius: number) => ({
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
    });

    export const spreadWidth = (width: number) => ({
        borderTopWidth: width,
        borderRightWidth: width,
        borderBottomWidth: width,
        borderLeftWidth: width,
    });

    export const normalizeCornerRadii = (width: number, height: number, radii: BorderRadiusDefs): BorderRadiusDefs => {
        const safeWidth = Math.max(0, width);
        const safeHeight = Math.max(0, height);

        const topSum = radii.borderTopLeftRadius + radii.borderTopRightRadius;
        const bottomSum = radii.borderBottomLeftRadius + radii.borderBottomRightRadius;
        const leftSum = radii.borderTopLeftRadius + radii.borderBottomLeftRadius;
        const rightSum = radii.borderTopRightRadius + radii.borderBottomRightRadius;

        const scale = Math.min(
            1,
            topSum > 0 ? safeWidth / topSum : 1,
            bottomSum > 0 ? safeWidth / bottomSum : 1,
            leftSum > 0 ? safeHeight / leftSum : 1,
            rightSum > 0 ? safeHeight / rightSum : 1,
        );

        return {
            borderTopLeftRadius: radii.borderTopLeftRadius * scale,
            borderTopRightRadius: radii.borderTopRightRadius * scale,
            borderBottomRightRadius: radii.borderBottomRightRadius * scale,
            borderBottomLeftRadius: radii.borderBottomLeftRadius * scale,
        };
    };

    const getRoundedRectPathInternal = (
        x: number,
        y: number,
        width: number,
        height: number,
        radii: BorderRadiusDefs,
    ): string => {
        const right = x + width;
        const bottom = y + height;

        const {
            borderBottomLeftRadius: bl,
            borderBottomRightRadius: br,
            borderTopLeftRadius: tl,
            borderTopRightRadius: tr,
        } = normalizeCornerRadii(width, height, radii);

        return [
            `M ${x + tl} ${y}`,
            `L ${right - tr} ${y}`,
            tr > 0 ? `A ${tr} ${tr} 0 0 1 ${right} ${y + tr}` : `L ${right} ${y}`,

            `L ${right} ${bottom - br}`,
            br > 0 ? `A ${br} ${br} 0 0 1 ${right - br} ${bottom}` : `L ${right} ${bottom}`,

            `L ${x + bl} ${bottom}`,
            bl > 0 ? `A ${bl} ${bl} 0 0 1 ${x} ${bottom - bl}` : `L ${x} ${bottom}`,

            `L ${x} ${y + tl}`,
            tl > 0 ? `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}` : `L ${x} ${y}`,

            "Z",
        ].join(" ");
    };

    export const getRoundedRectPaths = ({
        x,
        y,
        width,
        height,
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomRightRadius,
        borderBottomLeftRadius,
        borderTopWidth,
        borderRightWidth,
        borderBottomWidth,
        borderLeftWidth,
    }: Point2d & Size2d & BorderWidthDefs & BorderRadiusDefs): { outerPath: string; innerPath: string } => {
        const outerRadii = normalizeCornerRadii(width, height, {
            borderTopLeftRadius: Math.max(0, borderTopLeftRadius),
            borderTopRightRadius: Math.max(0, borderTopRightRadius),
            borderBottomRightRadius: Math.max(0, borderBottomRightRadius),
            borderBottomLeftRadius: Math.max(0, borderBottomLeftRadius),
        });

        const innerX = x + borderLeftWidth;
        const innerY = y + borderTopWidth;
        const innerWidth = Math.max(0, width - borderLeftWidth - borderRightWidth);
        const innerHeight = Math.max(0, height - borderTopWidth - borderBottomWidth);

        const innerRadii = normalizeCornerRadii(innerWidth, innerHeight, {
            borderTopLeftRadius: Math.max(
                0,
                outerRadii.borderTopLeftRadius - Math.max(borderLeftWidth, borderTopWidth),
            ),
            borderTopRightRadius: Math.max(
                0,
                outerRadii.borderTopRightRadius - Math.max(borderRightWidth, borderTopWidth),
            ),
            borderBottomRightRadius: Math.max(
                0,
                outerRadii.borderBottomRightRadius - Math.max(borderRightWidth, borderBottomWidth),
            ),
            borderBottomLeftRadius: Math.max(
                0,
                outerRadii.borderBottomLeftRadius - Math.max(borderLeftWidth, borderBottomWidth),
            ),
        });

        return {
            outerPath: getRoundedRectPathInternal(x, y, width, height, outerRadii),
            innerPath:
                innerWidth > 0 && innerHeight > 0
                    ? getRoundedRectPathInternal(innerX, innerY, innerWidth, innerHeight, innerRadii)
                    : "",
        };
    };

    const BORDER_TRAVERSAL_LOOP = [
        "topCenterRight",
        "topRight",
        "rightCenterTop",
        "rightCenterBottom",
        "bottomRight",
        "bottomCenterRight",
        "bottomCenterLeft",
        "bottomLeft",
        "leftCenterBottom",
        "leftCenterTop",
        "topLeft",
        "topCenterLeft",
    ] as const;

    export type BorderTraversalKey = (typeof BORDER_TRAVERSAL_LOOP)[number];

    export type BorderTraversalLengths = { [K in BorderTraversalKey]: number };

    export type BorderTraversalDirection = "clockwise" | "counterclockwise";

    export type BorderTraversalVisibilityMode = "persistent" | "transient";

    export type BorderTraversalPathDefs = {
        from: BorderTraversalKey;
        to: BorderTraversalKey;
        dir: BorderTraversalDirection;
    };

    export const getBorderTraversalPath = (defs: BorderTraversalPathDefs): BorderTraversalKey[] => {
        const fromIdx = BORDER_TRAVERSAL_LOOP.indexOf(defs.from);
        const toIdx = BORDER_TRAVERSAL_LOOP.indexOf(defs.to);

        if (fromIdx === -1 || toIdx === -1) return [];

        const path: BorderTraversalKey[] = [];
        const step = defs.dir === "clockwise" ? 1 : -1;

        for (let idx = fromIdx; ; idx = (idx + step + BORDER_TRAVERSAL_LOOP.length) % BORDER_TRAVERSAL_LOOP.length) {
            path.push(BORDER_TRAVERSAL_LOOP[idx]);

            if (idx === toIdx) break;
        }

        return path;
    };

    export const getBorderTraversalLengths = (
        size: Size2d,
        radii: BorderRadiusDefs,
    ): Partial<BorderTraversalLengths> => {
        const getPositiveLengthOrUndefined = (length: number) => (length > 0 ? length : undefined);

        const getQuarterCircleLength = (radius: number) => (radius > 0 ? (Math.PI * radius) / 2 : undefined);

        const halfWidth = size.width * 0.5;
        const halfHeight = size.height * 0.5;

        const topLeftRadius = radii.borderTopLeftRadius;
        const topRightRadius = radii.borderTopRightRadius;
        const bottomRightRadius = radii.borderBottomRightRadius;
        const bottomLeftRadius = radii.borderBottomLeftRadius;

        return {
            topLeft: getQuarterCircleLength(topLeftRadius),
            topRight: getQuarterCircleLength(topRightRadius),
            bottomRight: getQuarterCircleLength(bottomRightRadius),
            bottomLeft: getQuarterCircleLength(bottomLeftRadius),

            topCenterLeft: getPositiveLengthOrUndefined(halfWidth - topLeftRadius),
            topCenterRight: getPositiveLengthOrUndefined(halfWidth - topRightRadius),
            rightCenterTop: getPositiveLengthOrUndefined(halfHeight - topRightRadius),
            rightCenterBottom: getPositiveLengthOrUndefined(halfHeight - bottomRightRadius),
            bottomCenterRight: getPositiveLengthOrUndefined(halfWidth - bottomRightRadius),
            bottomCenterLeft: getPositiveLengthOrUndefined(halfWidth - bottomLeftRadius),
            leftCenterBottom: getPositiveLengthOrUndefined(halfHeight - bottomLeftRadius),
            leftCenterTop: getPositiveLengthOrUndefined(halfHeight - topLeftRadius),
        };
    };

    export const getBorderTraversalKeyTimes = (
        fullPath: BorderTraversalKey[],
        traversalLengths: Partial<BorderTraversalLengths>,
        visibilityMode: BorderTraversalVisibilityMode,
    ): number[] => {
        const lengths = fullPath.map((key) => traversalLengths[key]);

        if (lengths.some((length) => length === undefined)) return [];

        const tailLengths = visibilityMode === "persistent" ? [lengths.at(-1) ?? 0, lengths.at(-1) ?? 0] : [];
        const allLengths = [...lengths, ...tailLengths] as number[];
        const total = allLengths.reduce((sum, length) => sum + length, 0);

        if (total <= 0) return [];

        let acc = 0;

        return [
            0,
            ...allLengths.map((length) => {
                acc += length;
                return acc / total;
            }),
        ];
    };
}

export namespace BorderAnimationUtils {
    export type BorderAnimationDefs = {
        getAnimationDurationMs: () => number;
    };

    const getCommonAnimDefs = (defs: BorderAnimationDefs) => ({
        dur: `${defs.getAnimationDurationMs()}ms`,
        repeatCount: "indefinite" as const,
    });

    const ROT_STEP_SIZE = 15;
    const DIAGONAL_RAD = (45 * Math.PI) / 180;

    export namespace Linear {
        export const grow = (vName: "x" | "y", v1: number, v2: number, sArr: number[], defs: BorderAnimationDefs) => {
            const commonDefs = getCommonAnimDefs(defs);
            const halfDist = Math.abs(v2 - v1) * 0.5;

            return (
                <>
                    <animate
                        attributeName={`${vName}1`}
                        values={sArr.map((s) => `${v1 + halfDist - halfDist * s}`).join(";")}
                        {...commonDefs}
                    />
                    <animate
                        attributeName={`${vName}2`}
                        values={sArr.map((s) => `${v2 - halfDist + halfDist * s}`).join(";")}
                        {...commonDefs}
                    />
                </>
            );
        };

        export const sweepOrthogonal = (
            vName: "x" | "y",
            v1: number,
            v2: number,
            oArr: number[],
            defs: BorderAnimationDefs,
        ) => {
            const commonDefs = getCommonAnimDefs(defs);

            return (
                <>
                    <animate
                        attributeName={`${vName}1`}
                        values={oArr.map((o) => `${v1 + o}`).join(";")}
                        {...commonDefs}
                    />
                    <animate
                        attributeName={`${vName}2`}
                        values={oArr.map((o) => `${v2 + o}`).join(";")}
                        {...commonDefs}
                    />
                </>
            );
        };

        export const sweepDiagonal = (
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            oArr: [number, number][],
            defs: BorderAnimationDefs,
        ) => {
            const points = [
                [x1, y1],
                [x2, y2],
            ];
            const commonDefs = getCommonAnimDefs(defs);

            return (
                <For each={points}>
                    {(point, getIndex) => {
                        const x = point[0];
                        const y = point[1];

                        return (
                            <>
                                <animate
                                    attributeName={`x${getIndex() + 1}`}
                                    values={oArr.map((o) => `${x + o[0] * Math.cos(DIAGONAL_RAD)}`).join(";")}
                                    {...commonDefs}
                                />
                                <animate
                                    attributeName={`y${getIndex() + 1}`}
                                    values={oArr.map((o) => `${y + o[1] * Math.sin(DIAGONAL_RAD)}`).join(";")}
                                    {...commonDefs}
                                />
                            </>
                        );
                    }}
                </For>
            );
        };

        const V_KEYS = ["x1", "y1", "x2", "y2"] as const;

        // TODO: send vArray of [from, to] instead
        export const rotate = (from: number, to: number, defs: BorderAnimationDefs) => {
            const stepCount = Math.round(Math.abs(to - from) / ROT_STEP_SIZE) + 1;
            const steps = Array.from({ length: stepCount }, (_, index) =>
                SVGUtils.getLinearCoords({
                    angle: from < to ? from + ROT_STEP_SIZE * index : from - ROT_STEP_SIZE * index,
                }),
            );
            const commonDefs = getCommonAnimDefs(defs);

            return (
                <For each={V_KEYS}>
                    {(vKey) => (
                        <animate
                            attributeName={vKey}
                            values={steps.map((step) => step[vKey]).join(";")}
                            {...commonDefs}
                        />
                    )}
                </For>
            );
        };
    }

    export namespace Radial {
        export const grow = (rArr: number[], defs: BorderAnimationDefs) => {
            return <animate attributeName="r" values={rArr.join(";")} {...getCommonAnimDefs(defs)} />;
        };

        export const sweepOrthogonal = (vName: "cx" | "cy", vArr: number[], defs: BorderAnimationDefs) => {
            return <animate attributeName={vName} values={vArr.join(";")} {...getCommonAnimDefs(defs)} />;
        };

        export const sweepDiagonal = (cx: number, cy: number, oArr: [number, number][], defs: BorderAnimationDefs) => {
            const commonDefs = getCommonAnimDefs(defs);

            return (
                <>
                    <animate
                        attributeName="cx"
                        values={oArr.map((o) => `${cx + o[0] * Math.cos(DIAGONAL_RAD)}`).join(";")}
                        {...commonDefs}
                    />
                    <animate
                        attributeName="cy"
                        values={oArr.map((o) => `${cy + o[1] * Math.sin(DIAGONAL_RAD)}`).join(";")}
                        {...commonDefs}
                    />
                </>
            );
        };
    }

    export namespace Path {
        // TODO: send vArray of [from, to, from, to] instead
        export const getRotatingArc = (
            fromRotation: number,
            toRotation: number,
            fromArcSize: number,
            toArcSize: number,
            defs: BorderAnimationDefs,
        ) => {
            const stepCount = Math.round(Math.abs(toRotation - fromRotation) / ROT_STEP_SIZE) + 1;
            const arcStepSize = Math.round(Math.abs(toArcSize - fromArcSize) / stepCount);
            const steps = Array.from({ length: stepCount }, (_, index) =>
                SVGUtils.getArcPath(
                    fromArcSize < toArcSize ? fromArcSize + arcStepSize * index : fromArcSize - arcStepSize * index,
                    fromRotation < toRotation
                        ? fromRotation + ROT_STEP_SIZE * index
                        : fromRotation - ROT_STEP_SIZE * index,
                ),
            );
            const commonDefs = getCommonAnimDefs(defs);

            return (
                <path d={steps[0]}>
                    <animate attributeName="d" values={steps.join(";")} {...commonDefs} />
                </path>
            );
        };
    }
}
