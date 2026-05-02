import { keyframes, style } from "@vanilla-extract/css";

export const slideH = keyframes({
    "0%": {
        borderWidth: 0,
        transform: "translateX(0)",
    },
    "50%": {
        borderWidth: 2,
        transform: "translateX(200%)",
    },
    "100%": {
        borderWidth: 0,
        transform: "translateX(0)",
    },
});

export const slideV = keyframes({
    "0%": {
        borderWidth: 0,
        transform: "translateY(0)",
    },
    "50%": {
        borderWidth: 2,
        transform: "translateY(200%)",
    },
    "100%": {
        borderWidth: 0,
        transform: "translateY(0)",
    },
});

export const root = style({
    display: "flex",
    flexDirection: "column",
    gap: 20,
});

export const anchorWrapper = style({
    width: "fit-content",
    animationDuration: "10000ms",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    animationFillMode: "both",
});

export const overlayOn = style({
    backdropFilter: "blur(5px) grayscale(75%)",
});

export const overlayOff = style({
    backdropFilter: "none",
});
