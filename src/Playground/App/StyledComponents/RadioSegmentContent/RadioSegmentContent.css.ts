import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isChecked = style({});
export const isHovered = style({});
export const isDisabled = style({});
export const hasError = style({});
export const isVisible = style({});

export const segmentGroup = style({
    width: "fit-content",
    padding: themeVars.spacing.half,
    border: `1px solid rgb(from currentColor r g b / 25%)`,
    borderRadius: themeVars.borderRadius.full,
    backgroundColor: themeVars.color.background.dark,
});

export const segmentContent = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    paddingInline: themeVars.spacing.double,
    transition: `color ${themeVars.animation.duration}, filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isChecked}`]: {
            color: themeVars.color.primary.contrast,
        },
        [`&.${hasError}`]: {
            color: themeVars.color.error.main,
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

export const segmentFloater = style({
    borderRadius: themeVars.borderRadius.half,
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.primary.dark}, ${themeVars.color.primary.light})`,
    opacity: 0,
    transitionProperty: "opacity",

    selectors: {
        [`&.${isVisible}`]: {
            opacity: 1,
        },
    },
});
