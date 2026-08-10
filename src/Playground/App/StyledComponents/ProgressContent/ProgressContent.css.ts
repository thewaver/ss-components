import { keyframes, style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isIndeterminate = style({});
export const hasError = style({});

const sweep = keyframes({
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(300%)" },
});

export const progressTrack = style({
    position: "relative",
    overflow: "hidden",
    width: "100%",
    height: 8,
    boxShadow: themeVars.shadow.small,
    border: `2px solid rgb(from currentColor r g b / 25%)`,
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: "black",
    transition: `border-color ${themeVars.animation.duration}`,

    selectors: {
        [`&.${hasError}`]: {
            borderColor: themeVars.color.error.main,
        },
    },
});

export const progressFill = style({
    height: "100%",
    borderRadius: themeVars.borderRadius.half,
    backgroundImage: `linear-gradient(90deg, ${themeVars.color.primary.dark}, ${themeVars.color.primary.light})`,
    transition: `width ${themeVars.animation.duration}`,

    selectors: {
        [`${progressTrack}.${hasError} &`]: {
            backgroundImage: `linear-gradient(90deg, ${themeVars.color.error.dark}, ${themeVars.color.error.light})`,
        },
        [`${progressTrack}.${isIndeterminate} &`]: {
            width: "33%",
            animation: `${sweep} 1.2s linear infinite`,
            transition: "none",
        },
    },
});

export const progressReadout = style({
    fontSize: themeVars.fontSize.xSmall,
    fontVariantNumeric: "tabular-nums",
    opacity: 0.75,
});

export const progressRow = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.half,
    width: "100%",
    minWidth: 200,
});
