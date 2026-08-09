import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isChecked = style({});
export const isHovered = style({});
export const isDisabled = style({});
export const hasError = style({});

export const radioContent = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.full,
    height: 40,
    paddingInline: themeVars.spacing.full,
    borderRadius: themeVars.borderRadius.half,
    transition: `filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}`]: {
            filter: themeVars.hover.filter,
        },
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: themeVars.disabled.opacity,
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
    boxShadow: themeVars.shadow.small,
    border: `2px solid rgb(from currentColor r g b / 25%)`,
    borderRadius: "50%",
    backgroundColor: "black",
    transition: `border-color ${themeVars.animation.duration}`,

    selectors: {
        [`${radioContent}.${hasError} &`]: {
            borderColor: themeVars.color.error.main,
        },
    },
});

export const radioDot = style({
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.primary.dark}, ${themeVars.color.primary.light})`,
    transform: "scale(0)",
    transition: `transform ${themeVars.animation.duration}`,

    selectors: {
        [`${radioContent}.${isChecked} &`]: {
            transform: "scale(1)",
        },
    },
});
