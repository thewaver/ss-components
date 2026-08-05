import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

export const isChecked = style({});
export const isMixed = style({});
export const isHovered = style({});

export const toggleContent = style({
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: 44,
    height: 24,
    boxShadow: "var(--shd-tiny)",
    border: "2px solid rgba(from var(--clr-text) r g b / 25%)",
    borderRadius: 12,
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

export const toggleHandle = style({
    position: "absolute",
    left: 2,
    width: 16,
    height: 16,
    borderRadius: "50%",
    backgroundImage: "linear-gradient(45deg, var(--clr-primary), var(--clr-secondary))",
    transform: "translateX(0)",
    transition: "transform var(--anim-duration)",

    selectors: {
        [`${toggleContent}.${isMixed} &`]: {
            transform: "translateX(10px)",
        },
        [`${toggleContent}.${isChecked} &`]: {
            transform: "translateX(20px)",
        },
    },
});
