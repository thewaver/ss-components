import type { Point2d, Size2d } from "@thewaver/ss-utils";

import type { CSSBorderRadius, CSSBorderWidth } from "../../Abstracts/CSS/CSS.types";

export namespace SurfaceUtils {
    export const fitCornerRadii = (width: number, height: number, radii: CSSBorderRadius): CSSBorderRadius => {
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
        radii: CSSBorderRadius,
    ): string => {
        const right = x + width;
        const bottom = y + height;

        const {
            borderBottomLeftRadius: bl,
            borderBottomRightRadius: br,
            borderTopLeftRadius: tl,
            borderTopRightRadius: tr,
        } = fitCornerRadii(width, height, radii);

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

    export const getCornerRadii = ({
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
    }: Size2d & CSSBorderWidth & CSSBorderRadius) => {
        const outerRadii = fitCornerRadii(width, height, {
            borderTopLeftRadius: Math.max(borderTopLeftRadius, 0),
            borderTopRightRadius: Math.max(borderTopRightRadius, 0),
            borderBottomRightRadius: Math.max(borderBottomRightRadius, 0),
            borderBottomLeftRadius: Math.max(borderBottomLeftRadius, 0),
        });

        const innerWidth = Math.max(width - borderLeftWidth - borderRightWidth, 0);
        const innerHeight = Math.max(height - borderTopWidth - borderBottomWidth, 0);

        const innerRadii = fitCornerRadii(innerWidth, innerHeight, {
            borderTopLeftRadius: Math.max(
                outerRadii.borderTopLeftRadius - Math.max(borderLeftWidth, borderTopWidth),
                0,
            ),
            borderTopRightRadius: Math.max(
                outerRadii.borderTopRightRadius - Math.max(borderRightWidth, borderTopWidth),
                0,
            ),
            borderBottomRightRadius: Math.max(
                outerRadii.borderBottomRightRadius - Math.max(borderRightWidth, borderBottomWidth),
                0,
            ),
            borderBottomLeftRadius: Math.max(
                outerRadii.borderBottomLeftRadius - Math.max(borderLeftWidth, borderBottomWidth),
                0,
            ),
        });

        return {
            innerRadii,
            outerRadii,
        };
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
    }: Point2d & Size2d & CSSBorderWidth & CSSBorderRadius) => {
        const innerX = x + borderLeftWidth;
        const innerY = y + borderTopWidth;

        const innerWidth = Math.max(width - borderLeftWidth - borderRightWidth, 0);
        const innerHeight = Math.max(height - borderTopWidth - borderBottomWidth, 0);

        const { innerRadii, outerRadii } = getCornerRadii({
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
        });

        return {
            outerRadii,
            outerPath: getRoundedRectPathInternal(x, y, width, height, outerRadii),
            innerRadii,
            innerPath:
                innerWidth > 0 && innerHeight > 0
                    ? getRoundedRectPathInternal(innerX, innerY, innerWidth, innerHeight, innerRadii)
                    : "",
        };
    };
}
