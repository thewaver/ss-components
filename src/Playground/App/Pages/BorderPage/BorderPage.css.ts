import { keyframes, style } from "@vanilla-extract/css";

const rotate = keyframes({
    "0%": { transform: "rotate(0)" },
    "100%": { transform: "rotate(360deg)" },
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

export const borderedElement = style({
    position: "relative",
    width: 240,
    height: 240,
    padding: 20,

    selectors: {
        "&::before": {
            content: "",
            position: "absolute",
            inset: "-41.5%", // approx SQRT2
            zIndex: -1,
            backgroundImage: "linear-gradient(135deg, #8000FF40, #FF8000C0)",
            animationName: rotate,
            animationDuration: "5s",
            animationFillMode: "both",
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
        },
    },
});
