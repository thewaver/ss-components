import type { Point2d, Size2d } from "@thewaver/ss-utils";

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
