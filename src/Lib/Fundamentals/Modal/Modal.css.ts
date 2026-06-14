import { style } from "@vanilla-extract/css";

export const modalRoot = style({
    position: "relative",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
});

export const modalOverlay = style({
    position: "absolute",
    inset: 0,
    zIndex: 100,

    display: "grid",
    pointerEvents: "all",
});

export const modalContainer = style({
    zIndex: 100,
    pointerEvents: "all",
});
