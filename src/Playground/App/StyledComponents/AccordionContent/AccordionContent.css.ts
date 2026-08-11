import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isExpanded = style({});
export const isHovered = style({});
export const isDisabled = style({});

export const accordionHeader = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: themeVars.spacing.full,
    width: "100%",
    borderRadius: themeVars.borderRadius.half,
    padding: themeVars.spacing.full,
    backgroundImage: `linear-gradient(215deg, ${themeVars.color.surface.dark}, ${themeVars.color.surface.dark})`,
    fontSize: themeVars.fontSize.medium,
    transition: `filter ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}`]: {
            filter: themeVars.hover.filter,
        },
        [`&.${isDisabled}`]: {
            opacity: themeVars.disabled.opacity,
            filter: themeVars.disabled.filter,
        },
    },
});

export const accordionMarker = style({
    fontSize: themeVars.fontSize.small,
    transition: `transform ${themeVars.animation.duration}`,

    selectors: {
        [`${accordionHeader}.${isExpanded} &`]: {
            transform: "rotate(90deg)",
        },
    },
});

export const accordionPanel = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.full,
    padding: themeVars.spacing.full,
    fontSize: themeVars.fontSize.small,
    backgroundImage: `linear-gradient(215deg, ${themeVars.color.surface.dark}, ${themeVars.color.surface.dark})`,
});
