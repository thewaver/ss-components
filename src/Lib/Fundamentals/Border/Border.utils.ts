import type { Point2d, Size2d } from "@thewaver/ss-utils";

import type { BorderRadiusDefs, BorderWidthDefs } from "./Border.types";

export namespace BorderUtils {
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
}
