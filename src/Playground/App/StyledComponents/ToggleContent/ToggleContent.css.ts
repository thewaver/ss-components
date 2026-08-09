import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isChecked = style({});
export const isMixed = style({});
export const isHovered = style({});
export const isDisabled = style({});
export const hasError = style({});

export const toggleContent = style({
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: 44,
    height: 24,
    boxShadow: themeVars.shadow.small,
    border: `2px solid rgb(from currentColor r g b / 25%)`,
    borderRadius: 12,
    backgroundColor: "black",
    transition: `filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}, border-color ${themeVars.animation.duration}`,

    selectors: {
        [`&.${hasError}`]: {
            borderColor: themeVars.color.error.main,
        },
        [`&.${isHovered}`]: {
            filter: themeVars.hover.filter,
        },
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: themeVars.disabled.opacity,
        },
    },
});

export const toggleHandle = style({
    position: "absolute",
    left: 2,
    width: 16,
    height: 16,
    borderRadius: "50%",
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.primary.dark}, ${themeVars.color.primary.light})`,
    transform: "translateX(0)",
    transition: `transform ${themeVars.animation.duration}`,

    selectors: {
        [`${toggleContent}.${isMixed} &`]: {
            transform: "translateX(10px)",
        },
        [`${toggleContent}.${isChecked} &`]: {
            transform: "translateX(20px)",
        },
    },
});
