import { keyframes, style } from "@vanilla-extract/css";

export const typewriterFade = keyframes({
    "0%": {
        opacity: 0,
    },
    "100%": {
        opacity: 1,
    },
});

export const typewriterScale = keyframes({
    "0%": {
        opacity: 0,
        transform: "scale(2)",
    },
    "25%": {
        opacity: 1,
        transform: "scale(2)",
    },
    "100%": {
        opacity: 1,
        transform: "scale(1)",
    },
});

export const typewriterGlow = keyframes({
    "0%": {
        opacity: 0,
        filter: "saturate(0) brightness(4)",
    },
    "25%": {
        opacity: 1,
        filter: "saturate(0) brightness(4)",
    },
    "100%": {
        opacity: 1,
        filter: "saturate(1) brightness(1)",
    },
});

export const root = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    gap: 40,
});

export const textArea = style({
    minWidth: 320,
    minHeight: 160,
});

export const textHighlight = style({
    textTransform: "uppercase",
    lineHeight: 2,
});
