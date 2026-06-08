import { style } from "@vanilla-extract/css";

export const borderRoot = style({
    position: "relative",
    width: "fit-content",
});

export const borderSVG = style({
    position: "absolute",
    pointerEvents: "none",
});

export const borderChildren = style({
    display: "grid",
    overflow: "hidden",
});
