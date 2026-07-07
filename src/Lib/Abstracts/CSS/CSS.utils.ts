import type { CSSBorderRadius, CSSBorderWidth, CSSCornerShape, CSSMargin, CSSPadding } from "./CSS.types";

export namespace CSSUtils {
    export const spreadCornerShape = (lameExponent: number): CSSCornerShape => ({
        cornerBottomLeftShape: lameExponent,
        cornerBottomRightShape: lameExponent,
        cornerTopLeftShape: lameExponent,
        cornerTopRightShape: lameExponent,
    });

    export const spreadRadius = (radius: number): CSSBorderRadius => ({
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
    });

    export const spreadWidth = (width: number): CSSBorderWidth => ({
        borderTopWidth: width,
        borderRightWidth: width,
        borderBottomWidth: width,
        borderLeftWidth: width,
    });

    export const spreadPadding = (width: number): CSSPadding => ({
        paddingTop: width,
        paddingRight: width,
        paddingBottom: width,
        paddingLeft: width,
    });

    export const spreadMargin = (width: number): CSSMargin => ({
        marginTop: width,
        marginRight: width,
        marginBottom: width,
        marginLeft: width,
    });

    export const spreadableToStyle = <T extends CSSBorderRadius | CSSBorderWidth | CSSPadding | CSSMargin>(
        entries: T,
        mapKey: (key: keyof T) => string,
    ) => Object.fromEntries(Object.entries(entries).map(([key, value]) => [mapKey(key as keyof T), `${value}px`]));
}
