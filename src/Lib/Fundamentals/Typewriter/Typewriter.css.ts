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
    position: "absolute",
    left: -999999,
    top: -999999,
    width: "100%",
    visibility: "hidden",
    pointerEvents: "none",
    whiteSpace: "pre-wrap",
});

export const typewriterTextWrap = style({});

export const typewriterChar = style({
    display: "inline-block",
    animationFillMode: "both",
});

export const typewriterBlockLikeAtomic = style({
    display: "inline-block",
    width: "100%",
    animationFillMode: "both",
});
