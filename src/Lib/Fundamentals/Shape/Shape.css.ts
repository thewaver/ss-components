import { style } from "@vanilla-extract/css";

export const shapeRoot = style({
    position: "relative",
    pointerEvents: "visiblePainted",
});

export const shapeStrokeSVG = style({
    position: "absolute",
    zIndex: -1,
    pointerEvents: "none",
});
