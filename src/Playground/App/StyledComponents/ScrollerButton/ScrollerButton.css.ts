import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isHovered = style({});
export const isActive = style({});
export const isDisabled = style({});

export const scrollerButton = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 28,
    height: 28,
    color: themeVars.color.surface.contrast,
    backgroundColor: `rgb(from ${themeVars.color.surface.contrast} r g b / 10%)`,
    borderRadius: themeVars.borderRadius.half,
    fontSize: themeVars.fontSize.small,
    transition: `filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}`]: {
            color: themeVars.color.primary.main,
        },
        [`&.${isActive}`]: {
            filter: themeVars.active.filter,
        },
        [`&.${isDisabled}`]: {
            opacity: themeVars.disabled.opacity,
            filter: themeVars.disabled.filter,
        },
    },
});
