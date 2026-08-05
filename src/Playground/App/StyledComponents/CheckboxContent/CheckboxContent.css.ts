import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

export const isChecked = style({});
export const isMixed = style({});
export const isHovered = style({});

export const checkboxContent = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
    boxShadow: "var(--shd-tiny)",
    border: "2px solid rgba(from var(--clr-text) r g b / 25%)",
    borderRadius: 5,
    backgroundColor: "black",
    transition: "filter var(--anim-duration), opacity var(--anim-duration), border-color var(--anim-duration)",

    selectors: {
        [`&.${pageStyles.hasError}`]: {
            borderColor: "var(--clr-error)",
        },
        [`&.${isHovered}`]: {
            filter: "brightness(120%)",
        },
        [`&.${pageStyles.isDisabled}`]: {
            filter: "grayscale(1)",
            opacity: 0.5,
        },
    },
});

export const checkboxMark = style({
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundImage: "linear-gradient(45deg, var(--clr-primary), var(--clr-secondary))",
    transform: "scale(0)",
    transition: "transform var(--anim-duration), width var(--anim-duration), height var(--anim-duration)",

    selectors: {
        [`${checkboxContent}.${isChecked} &`]: {
            transform: "scale(1)",
        },
        [`${checkboxContent}.${isMixed} &`]: {
            width: 10,
            height: 3,
            transform: "scale(1)",
        },
    },
});
