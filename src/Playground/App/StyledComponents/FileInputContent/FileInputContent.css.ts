import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const FIELD_WIDTH = 200;
const FIELD_HEIGHT = 40;
const FIELD_BORDER = 2;
const FIELD_FONT_SIZE = themeVars.fontSize.medium;
const FIELD_LINE_HEIGHT = 1.25;

export const isHovered = style({});
export const isEmpty = style({});
export const isDisabled = style({});
export const hasError = style({});

export const fileInputContent = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.full,
    boxSizing: "border-box",
    width: FIELD_WIDTH,
    height: FIELD_HEIGHT,
    padding: themeVars.spacing.full,
    boxShadow: themeVars.shadow.small,
    border: `${FIELD_BORDER}px solid rgb(from currentColor r g b / 25%)`,
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: "black",
    fontSize: FIELD_FONT_SIZE,
    lineHeight: FIELD_LINE_HEIGHT,
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
    flexShrink: 0,
});

export const fileInputNames = style({
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",

    selectors: {
        [`&.${isEmpty}`]: {
            color: `rgb(from currentColor r g b / 50%)`,
            fontStyle: "italic",
        },
    },
});
