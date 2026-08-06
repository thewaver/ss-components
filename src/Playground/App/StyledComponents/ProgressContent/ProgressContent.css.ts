import { keyframes, style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

export const isIndeterminate = style({});

const sweep = keyframes({
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(300%)" },
});

export const progressTrack = style({
    position: "relative",
    overflow: "hidden",
    width: "100%",
    height: 8,
    boxShadow: "var(--shd-tiny)",
    border: "2px solid rgba(from var(--clr-text) r g b / 25%)",
    borderRadius: 6,
    backgroundColor: "black",
    transition: "border-color var(--anim-duration)",

    selectors: {
        [`&.${pageStyles.hasError}`]: {
            borderColor: "var(--clr-error)",
        },
    },
});

export const progressFill = style({
    height: "100%",
    borderRadius: 4,
    backgroundImage: "linear-gradient(90deg, var(--clr-primary), var(--clr-secondary))",
    transition: "width var(--anim-duration)",

    selectors: {
        [`${progressTrack}.${pageStyles.hasError} &`]: {
            backgroundImage: "linear-gradient(90deg, var(--clr-error), var(--clr-error))",
        },
        [`${progressTrack}.${isIndeterminate} &`]: {
            width: "33%",
            animation: `${sweep} 1.2s linear infinite`,
            transition: "none",
        },
    },
});

export const progressReadout = style({
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    opacity: 0.75,
});

export const progressRow = style({
    display: "flex",
    flexDirection: "column",
    gap: 6,
    width: "100%",
    minWidth: 260,
});
