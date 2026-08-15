import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isCurrent = style({});
export const isHovered = style({});
export const isDisabled = style({});

export const breadcrumbContent = style({
    display: "flex",
    alignItems: "center",
    height: 32,
    paddingInline: themeVars.spacing.half,
    borderRadius: themeVars.borderRadius.half,
    color: themeVars.color.primary.main,
    fontSize: themeVars.fontSize.small,
    whiteSpace: "nowrap",
    transition: `color ${themeVars.animation.duration}, filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isCurrent}`]: {
            color: themeVars.color.background.contrast,
            fontWeight: "bold",
        },
        [`&.${isHovered}`]: {
            filter: themeVars.hover.filter,
            textDecoration: "underline",
        },
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: themeVars.disabled.opacity,
        },
    },
});

export const breadcrumbSeparator = style({
    paddingInline: themeVars.spacing.half,
    color: `rgb(from currentColor r g b / 50%)`,
    fontSize: themeVars.fontSize.small,
});
