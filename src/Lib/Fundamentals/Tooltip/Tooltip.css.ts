import { style, styleVariants } from "@vanilla-extract/css";

export const tooltipRoot = style({
    position: "absolute",
    pointerEvents: "none",
    zIndex: 1,
});

export const tooltipHPlacementVariant = styleVariants({
    "left-in": {
        left: 0,
    },
    "left-out": {
        right: "100%",
    },
    "right-in": {
        right: 0,
    },
    "right-out": {
        left: "100%",
    },
    "center": {
        left: "50%",
    },
});

export const tooltipVPlacementVariant = styleVariants({
    "top-in": {
        top: 0,
    },
    "top-out": {
        bottom: "100%",
    },
    "bottom-in": {
        bottom: 0,
    },
    "bottom-out": {
        top: "100%",
    },
    "center": {
        top: "50%",
    },
});
