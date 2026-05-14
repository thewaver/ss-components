import { keyframes, style } from "@vanilla-extract/css";

const rotate = keyframes({
    "0%": { transform: "rotate(0)" },
    "100%": { transform: "rotate(360deg)" },
});

const swipe = keyframes({
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(100%)" },
});

export const root = style({});

export const container = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    gap: 20,
    maxWidth: 600,
});

export const borderedContainerRotate = style({
    position: "relative",
    backgroundColor: "#8000FF40",

    selectors: {
        "&::before": {
            content: "",
            position: "absolute",
            inset: "-41.5%", // approx SQRT2
            zIndex: -1,
            backgroundImage: "linear-gradient(135deg, #FF800000, #FF8000C0)",
            animationName: rotate,
            animationDuration: "5s",
            animationFillMode: "both",
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
        },
    },
});

export const borderedContainerSwipe = style({
    position: "relative",
    backgroundColor: "#8000FF40",

    selectors: {
        "&::before": {
            content: "",
            position: "absolute",
            inset: 0,
            zIndex: -1,
            backgroundImage: "linear-gradient(90deg, #FF800000, #FF800040, #FF800000)",
            animationName: swipe,
            animationDuration: "2s",
            animationFillMode: "both",
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
        },
    },
});

export const borderedContent = style({
    width: 240,
    height: 240,
    padding: 20,
});
