import { style } from "@vanilla-extract/css";

export const shapeRoot = style({
    position: "relative",
    width: "fit-content",
    height: "fit-content",
    pointerEvents: "visiblePainted",
});

export const shapeStrokeSVG = style({
    position: "absolute",
    zIndex: -1,
    pointerEvents: "none",
});
