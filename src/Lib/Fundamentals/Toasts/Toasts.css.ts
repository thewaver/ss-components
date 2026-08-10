import { style } from "@vanilla-extract/css";

export const toastsRegion = style({
    position: "absolute",
    inset: 0,

    display: "flex",
    pointerEvents: "none",
});

export const toastsItem = style({
    flexShrink: 0,
    maxWidth: "100%",
    pointerEvents: "all",
});
