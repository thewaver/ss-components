import { style } from "@vanilla-extract/css";

export const screenWiperRoot = style({
    position: "fixed",
    inset: 0,
    zIndex: 10,
});

export const screenWiperRow = style({
    display: "flex",
    flexDirection: "row",
});

export const screenWiperCell = style({});
