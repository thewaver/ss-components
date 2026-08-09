import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const FIELD_WIDTH = 240;
const FIELD_HEIGHT = 40;
const FIELD_BORDER = 2;
const FIELD_BOX_PADDING = 10;

export const FIELD_PADDING = FIELD_BOX_PADDING + FIELD_BORDER;
export const FIELD_CHEVRON_WIDTH = 10;
export const FIELD_GAP = 10;
export const FIELD_FONT_SIZE = themeVars.fontSize.medium;
export const FIELD_LINE_HEIGHT = 1.25;

export const isEmpty = style({});
export const isFiltering = style({});
export const isHovered = style({});
export const isActive = style({});
export const isOpen = style({});
export const isDisabled = style({});
export const hasError = style({});

export const selectContent = style({
    display: "flex",
    alignItems: "center",
    gap: FIELD_GAP,
    boxSizing: "border-box",
    width: FIELD_WIDTH,
    height: FIELD_HEIGHT,
    padding: FIELD_BOX_PADDING,
    boxShadow: themeVars.shadow.small,
    border: `${FIELD_BORDER}px solid rgb(from currentColor r g b / 25%)`,
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: "black",
    fontSize: FIELD_FONT_SIZE,
    lineHeight: FIELD_LINE_HEIGHT,
    textAlign: "left",
    transition: `filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}, border-color ${themeVars.animation.duration}`,

    selectors: {
        [`&.${hasError}`]: {
            borderColor: themeVars.color.error.main,
        },
        [`&.${isHovered}, &.${isOpen}`]: {
            filter: themeVars.hover.filter,
        },
        [`&.${isActive}`]: {
            filter: themeVars.active.filter,
        },
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: themeVars.disabled.opacity,
        },
    },
});

export const selectValue = style({
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    transition: `opacity ${themeVars.animation.duration}`,

    selectors: {
        [`${selectContent}.${isEmpty} &`]: {
            color: `rgb(from currentColor r g b / 50%)`,
        },
        [`${selectContent}.${isFiltering} &`]: {
            opacity: 0,
        },
    },
});

export const selectChevron = style({
    flexShrink: 0,
    width: 0,
    height: 0,
    borderLeft: `${FIELD_CHEVRON_WIDTH / 2}px solid transparent`,
    borderRight: `${FIELD_CHEVRON_WIDTH / 2}px solid transparent`,
    borderTop: "6px solid currentColor",
    transition: `transform ${themeVars.animation.duration}`,

    selectors: {
        [`${selectContent}.${isOpen} &`]: {
            transform: "rotate(180deg)",
        },
    },
});
