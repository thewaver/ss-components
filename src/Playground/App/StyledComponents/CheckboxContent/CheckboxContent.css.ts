import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isChecked = style({});
export const isMixed = style({});
export const isHovered = style({});
export const isDisabled = style({});
export const hasError = style({});

export const checkboxContent = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
    boxShadow: themeVars.shadow.small,
    border: `2px solid rgb(from currentColor r g b / 25%)`,
    borderRadius: themeVars.borderRadius.half,
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

export const checkboxMark = style({
    color: themeVars.color.primary.main,
    fontSize: themeVars.fontSize.medium,
    lineHeight: 1,
    transform: "scale(0)",
    transition: `transform ${themeVars.animation.duration}`,

    selectors: {
        [`${checkboxContent}.${isChecked} &, ${checkboxContent}.${isMixed} &`]: {
            transform: "scale(1)",
        },
    },
});
