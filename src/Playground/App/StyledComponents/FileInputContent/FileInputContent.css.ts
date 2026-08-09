import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const FIELD_WIDTH = 200;
const FIELD_BORDER = 2;

export const isHovered = style({});
export const isEmpty = style({});
export const isDisabled = style({});
export const hasError = style({});

export const fileInputContent = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.half,
    width: FIELD_WIDTH,
    padding: themeVars.spacing.full,
    boxShadow: themeVars.shadow.small,
    border: `${FIELD_BORDER}px dashed rgb(from currentColor r g b / 25%)`,
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

export const fileInputPrompt = style({
    fontSize: themeVars.fontSize.small,
    fontWeight: 600,
});

export const fileInputNames = style({
    fontSize: themeVars.fontSize.tiny,
    lineHeight: 1.4,
    color: `rgb(from currentColor r g b / 60%)`,
    overflowWrap: "anywhere",

    selectors: {
        [`&.${isEmpty}`]: {
            fontStyle: "italic",
        },
    },
});
