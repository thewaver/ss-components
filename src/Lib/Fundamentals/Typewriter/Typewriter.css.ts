import { keyframes, style } from "@vanilla-extract/css";

export const typewriterFade = keyframes({
    "0%": {
        opacity: 0,
        transform: "translateY(-200px) scale(3)",
    },
    "100%": {
        opacity: 1,
        transform: "translateY(0) scale(1)",
    },
});

export const typewriterRoot = style({
    position: "relative",
});

export const typewriterChildrenWrap = style({
    whiteSpace: "pre-wrap",
    width: "fit-content",
});

export const typewriterTextWrap = style({
    position: "absolute",
    inset: 0,
});

export const typewriterChar = style({
    display: "inline-block",
    animationFillMode: "both",
});
