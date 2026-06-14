import { createVar, style } from "@vanilla-extract/css";

export const paddingTop = createVar();
export const paddingRight = createVar();
export const paddingBottom = createVar();
export const paddingLeft = createVar();

export const borderTopWidth = createVar();
export const borderRightWidth = createVar();
export const borderBottomWidth = createVar();
export const borderLeftWidth = createVar();

export const borderTopLeftRadiusOuter = createVar();
export const borderTopRightRadiusOuter = createVar();
export const borderBottomRightRadiusOuter = createVar();
export const borderBottomLeftRadiusOuter = createVar();

export const borderTopLeftRadiusInner = createVar();
export const borderTopRightRadiusInner = createVar();
export const borderBottomRightRadiusInner = createVar();
export const borderBottomLeftRadiusInner = createVar();

export const surfaceRoot = style({
    position: "relative",
    width: "fit-content",
    pointerEvents: "visiblePainted",
});

export const surfaceStrokeSVG = style({
    position: "absolute",
    zIndex: -1,
    pointerEvents: "none",
});

export const surfaceFillSVG = style({
    position: "absolute",
    zIndex: -2,
});

const surfaceChildren = style({
    display: "grid",
});

export const surfaceChildrenInner = style([
    surfaceChildren,
    {
        paddingTop: `calc(${paddingTop} + ${borderTopWidth})`,
        paddingRight: `calc(${paddingRight} + ${borderRightWidth})`,
        paddingBottom: `calc(${paddingBottom} + ${borderBottomWidth})`,
        paddingLeft: `calc(${paddingLeft} + ${borderLeftWidth})`,

        borderTopLeftRadius: borderTopLeftRadiusInner,
        borderTopRightRadius: borderTopRightRadiusInner,
        borderBottomRightRadius: borderBottomRightRadiusInner,
        borderBottomLeftRadius: borderBottomLeftRadiusInner,
    },
]);

export const surfaceChildrenOuter = style([
    surfaceChildren,
    {
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,

        borderTopLeftRadius: borderTopLeftRadiusOuter,
        borderTopRightRadius: borderTopRightRadiusOuter,
        borderBottomRightRadius: borderBottomRightRadiusOuter,
        borderBottomLeftRadius: borderBottomLeftRadiusOuter,
    },
]);
