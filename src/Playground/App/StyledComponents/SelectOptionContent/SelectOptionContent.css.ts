import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isHovered = style({});
export const isHighlighted = style({});
export const isSelected = style({});
export const isDisabled = style({});

export const selectOptionContent = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: themeVars.spacing.full,
    padding: themeVars.spacing.full,
    borderRadius: themeVars.borderRadius.half,
    fontSize: themeVars.fontSize.medium,
    lineHeight: 1.25,
    whiteSpace: "nowrap",
    transition: `background-color ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHighlighted}`]: {
            backgroundColor: `rgb(from ${themeVars.color.surface.contrast} r g b / 10%)`,
        },
        [`&.${isHovered}`]: {
            backgroundColor: `rgb(from ${themeVars.color.surface.contrast} r g b / 20%)`,
        },
        [`&.${isSelected}`]: {
            color: themeVars.color.primary.main,
            fontWeight: 700,
        },
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: 0.4,
        },
    },
});

export const selectOptionText = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.half,
});

export const selectOptionDescription = style({
    maxWidth: "36ch",
    whiteSpace: "normal",
    fontSize: themeVars.fontSize.small,
    opacity: 0.6,
});

export const selectOptionMark = style({
    opacity: 0,

    selectors: {
        [`${selectOptionContent}.${isSelected} &`]: {
            opacity: 1,
        },
    },
});
