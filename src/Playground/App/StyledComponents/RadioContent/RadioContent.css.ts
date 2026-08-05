import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

export const isChecked = style({});
export const isHovered = style({});

export const radioContent = style({
    display: "flex",
    alignItems: "center",
    gap: 10,
    height: 40,
    paddingInline: 10,
    borderRadius: 5,
    transition: "filter var(--anim-duration), opacity var(--anim-duration)",

    selectors: {
        [`&.${isHovered}`]: {
            filter: "brightness(120%)",
        },
        [`&.${pageStyles.isDisabled}`]: {
            filter: "grayscale(1)",
            opacity: 0.5,
        },
    },
});

export const radioMarker = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    width: 20,
    height: 20,
    boxShadow: "var(--shd-tiny)",
    border: "2px solid rgba(from var(--clr-text) r g b / 25%)",
    borderRadius: "50%",
    backgroundColor: "black",
    transition: "border-color var(--anim-duration)",

    selectors: {
        [`${radioContent}.${pageStyles.hasError} &`]: {
            borderColor: "var(--clr-error)",
        },
    },
});

export const radioDot = style({
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundImage: "linear-gradient(45deg, var(--clr-primary), var(--clr-secondary))",
    transform: "scale(0)",
    transition: "transform var(--anim-duration)",

    selectors: {
        [`${radioContent}.${isChecked} &`]: {
            transform: "scale(1)",
        },
    },
});
