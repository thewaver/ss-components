import { style } from "@vanilla-extract/css";

export const viewportRoot = style({
    position: "fixed",
    top: 0,
    left: 0,
    transformOrigin: "top left",
    overflow: "hidden",
});

export const viewportContent = style({
    position: "relative",
    width: "100%",
    height: "100%",
});

export const viewportPortal = style({
    position: "absolute",
    inset: 0,
    zIndex: 10,
    pointerEvents: "none",
});
