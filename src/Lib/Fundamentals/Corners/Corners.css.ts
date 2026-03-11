import { style, styleVariants } from "@vanilla-extract/css";

export const cornersRoot = style({
    position: "relative",
    width: "100%",
    height: "100%",
});

export const cornerSVG = style({
    position: "absolute",
    zIndex: 1,
    pointerEvents: "none",
});

export const cornerVariant = styleVariants({
    bottomLeft: {
        bottom: 0,
        left: 0,
        transform: "scale(1, -1)",
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        transform: "scale(-1, -1)",
    },
    topLeft: {
        top: 0,
        left: 0,
        transform: "scale(1, 1)",
    },
    topRight: {
        top: 0,
        right: 0,
        transform: "scale(-1, 1)",
    },
});
