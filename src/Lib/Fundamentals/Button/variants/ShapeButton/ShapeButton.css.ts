import { createVar, style } from "@vanilla-extract/css";

export const shapeButtonTransitionDurationMs = createVar();

export const shapeButtonRoot = style({
    position: "relative",
});

export const shapeButtonSVG = style({});

export const shapeButtonGroup = style({
    cursor: "pointer",
    pointerEvents: "visiblePainted",

    selectors: {
        [`&:focus`]: {
            outline: "none",
        },
    },
});

export const shapeButtonPolygon = style({
    transition: `fill ${shapeButtonTransitionDurationMs}, stroke ${shapeButtonTransitionDurationMs}`,
});

export const shapeButtonPolygonOutline = style({
    display: "none",

    selectors: {
        [`${shapeButtonGroup}:focus-visible &`]: {
            display: "initial",
        },
    },
});

export const shapeButtonChildrenWrapper = style({
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
});
