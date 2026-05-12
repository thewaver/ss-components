import { style } from "@vanilla-extract/css";

export const borderRoot = style({
    position: "relative",
    width: "fit-content",
    overflow: "hidden",
});

export const borderSVG = style({
    position: "absolute",
    zIndex: 1,
    pointerEvents: "none",
});
