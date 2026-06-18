import { style, styleVariants } from "@vanilla-extract/css";

export const optionButton = style({
    width: "100%",
});

export const fpsCounter = style({
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,

    backgroundColor: "black",
    padding: 20,
    whiteSpace: "pre",
});

export const fpsCounterVariants = styleVariants({
    good: {
        color: "#80FF00",
    },
    mid: {
        color: "#FF8000",
    },
    bad: {
        color: "#FF0080",
    },
});
