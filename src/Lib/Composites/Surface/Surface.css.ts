import { style } from "@vanilla-extract/css";

export const surfaceDivRoot = style({
    position: "relative",
    overflow: "hidden",
});

export const surfaceDivBorder = style({
    position: "absolute",
    inset: 0,
    zIndex: 1,

    borderRadius: "inherit",
    borderStyle: "solid",
});
