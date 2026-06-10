import { style } from "@vanilla-extract/css";

export const surfaceRoot = style({
    position: "relative",
    width: "fit-content",
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

export const surfaceChildren = style({
    display: "grid",
});
