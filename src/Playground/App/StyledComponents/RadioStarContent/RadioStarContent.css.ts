import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isFilled = style({});
export const isHovered = style({});
export const isDisabled = style({});
export const hasError = style({});

export const starContent = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 32,
    height: 40,
    color: `rgb(from currentColor r g b / 25%)`,
    fontSize: themeVars.fontSize.large,
    lineHeight: 1,
    transition: `color ${themeVars.animation.duration}, filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isFilled}`]: {
            color: themeVars.color.alert.main,
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
