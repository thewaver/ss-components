import { style, styleVariants } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const itemGrid = style({
    display: "grid",
    fontSize: themeVars.fontSize.xSmall,
});

export const fpsCounter = style({
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,

    backgroundColor: "black",
    padding: themeVars.spacing.full,
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
