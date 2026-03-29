import { createVar, style } from "@vanilla-extract/css";

export const shapeButtonTransitionDurationMs = createVar();

export const shapeButtonRoot = style({
    position: "relative",
});

export const shapeButtonSVG = style({
    selectors: {
        [`&:focus`]: {
            outline: "none",
        },
    },
});

export const shapeButtonPolygon = style({
    cursor: "pointer",
    pointerEvents: "visiblePainted",
    transition: `fill ${shapeButtonTransitionDurationMs}, stroke ${shapeButtonTransitionDurationMs}`,
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
