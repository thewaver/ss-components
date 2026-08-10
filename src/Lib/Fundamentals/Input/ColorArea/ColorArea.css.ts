import { style } from "@vanilla-extract/css";

export const colorAreaSurface = style({
    position: "relative",
    pointerEvents: "all",
    touchAction: "none",
    width: "100%",
});

export const colorAreaAxis = style({
    appearance: "none",
    position: "absolute",
    top: 0,
    left: 0,

    width: "1px !important",
    height: "1px !important",
    minWidth: "0 !important",
    margin: "0 !important",
    padding: "0 !important",
    border: "none !important",
    borderRadius: "0 !important",
    background: "transparent !important",
    boxShadow: "none !important",
    opacity: 0,
    pointerEvents: "none",
});
