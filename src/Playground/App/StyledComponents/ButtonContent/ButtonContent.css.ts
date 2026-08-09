import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isHovered = style({});
export const isActive = style({});
export const isDisabled = style({});
export const hasError = style({});

export const buttonContent = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    color: themeVars.color.primary.contrast,
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.primary.dark}, ${themeVars.color.primary.light})`,
    borderRadius: themeVars.borderRadius.half,
    paddingInline: themeVars.spacing.double,
    boxShadow: themeVars.shadow.small,
    fontWeight: "bold",
    transition: `filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}, box-shadow ${themeVars.animation.duration}`,

    selectors: {
        [`&.${hasError}`]: {
            color: themeVars.color.error.contrast,
            backgroundImage: `linear-gradient(45deg, ${themeVars.color.error.dark}, ${themeVars.color.error.light})`,
        },
        [`&.${isHovered}`]: {
            filter: themeVars.hover.filter,
        },
        [`&.${isActive}`]: {
            filter: themeVars.active.filter,
        },
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: themeVars.disabled.opacity,
        },
    },
});
