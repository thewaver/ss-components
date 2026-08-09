import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isHovered = style({});
export const isActive = style({});
export const isHighlighted = style({});
export const isOpen = style({});
export const isDisabled = style({});

export const menuItemContent = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: themeVars.spacing.double,
    padding: themeVars.spacing.full,
    borderRadius: themeVars.borderRadius.half,
    fontSize: themeVars.fontSize.medium,
    lineHeight: 1.25,
    whiteSpace: "nowrap",
    transition: `background-color ${themeVars.animation.duration}, filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHighlighted}`]: {
            backgroundColor: `rgb(from ${themeVars.color.surface.contrast} r g b / 10%)`,
        },
        [`&.${isOpen}`]: {
            backgroundColor: `rgb(from ${themeVars.color.surface.contrast} r g b / 20%)`,
        },
        [`&.${isHovered}`]: {
            backgroundColor: `rgb(from ${themeVars.color.surface.contrast} r g b / 20%)`,
        },
        [`&.${isActive}`]: {
            filter: themeVars.active.filter,
        },
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: 0.4,
        },
    },
});

export const menuItemShortcut = style({
    opacity: 0.4,
    fontSize: themeVars.fontSize.xSmall,
});

export const menuItemSubmenuMark = style({
    opacity: 0.6,
    fontSize: themeVars.fontSize.medium,
    lineHeight: 1,
});
