import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isHovered = style({});
export const isFocused = style({});
export const isDisabled = style({});
export const hasError = style({});

export const tagInputContent = style({
    position: "absolute",
    inset: 0,
    border: `1px solid rgb(from currentColor r g b / 25%)`,
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: themeVars.color.background.dark,
    transition: `border-color ${themeVars.animation.duration}, filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}`]: {
            filter: themeVars.hover.filter,
        },
        [`&.${hasError}`]: {
            borderColor: themeVars.color.error.main,
        },
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: themeVars.disabled.opacity,
        },
    },
});

export const tagContent = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.half,
    height: 24,
    paddingInline: themeVars.spacing.full,
    borderRadius: themeVars.borderRadius.half,
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.primary.dark}, ${themeVars.color.primary.light})`,
    color: themeVars.color.primary.contrast,
    fontSize: themeVars.fontSize.xSmall,
    whiteSpace: "nowrap",
    transition: `filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}`]: {
            filter: themeVars.hover.filter,
        },
        [`&.${isFocused}`]: {
            outline: `2px solid ${themeVars.color.outline.main}`,
            outlineOffset: 1,
        },
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: themeVars.disabled.opacity,
        },
    },
});

export const tagRemove = style({
    fontSize: themeVars.fontSize.xSmall,
    opacity: 0.75,
});

export const tagInputPlaceholder = style({
    color: `rgb(from currentColor r g b / 50%)`,
    fontSize: themeVars.fontSize.small,
    pointerEvents: "none",
});
