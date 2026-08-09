import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const FIELD_BORDER = 2;
const SWATCH_SIZE = 24;

export const isHovered = style({});
export const isDisabled = style({});
export const hasError = style({});

export const colorInputContent = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.full,
    padding: themeVars.spacing.full,
    boxShadow: themeVars.shadow.small,
    border: `${FIELD_BORDER}px solid rgb(from currentColor r g b / 25%)`,
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: "black",
    transition: `filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}, border-color ${themeVars.animation.duration}`,

    selectors: {
        [`&.${hasError}`]: {
            borderColor: themeVars.color.error.main,
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

export const colorInputSwatch = style({
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: themeVars.borderRadius.half,
    boxShadow: `inset 0 0 0 1px rgb(from currentColor r g b / 30%)`,
});

export const colorInputValue = style({
    fontSize: themeVars.fontSize.small,
    fontVariantNumeric: "tabular-nums",
    textTransform: "uppercase",
});
