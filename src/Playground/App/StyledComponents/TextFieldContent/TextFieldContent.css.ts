import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const FIELD_WIDTH = 240;
export const FIELD_HEIGHT = 40;
const FIELD_BORDER = 2;

export const FIELD_PADDING = 10 + FIELD_BORDER;
export const FIELD_STEPPER_PADDING = {
    paddingTop: FIELD_PADDING,
    paddingRight: 5,
    paddingBottom: FIELD_PADDING,
    paddingLeft: FIELD_PADDING,
};
export const FIELD_GAP = 5;
export const FIELD_FONT_SIZE = themeVars.fontSize.medium;
export const FIELD_LINE_HEIGHT = 1.25;

export const isEmpty = style({});
export const isStretched = style({});
export const isTopAligned = style({});
export const isHovered = style({});
export const isReadOnly = style({});
export const isDisabled = style({});
export const hasError = style({});

export const fieldSurface = style({
    boxShadow: themeVars.shadow.small,
    border: `${FIELD_BORDER}px solid rgb(from currentColor r g b / 25%)`,
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: "black",
    transition: `filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}, border-color ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isReadOnly}`]: {
            backgroundColor: `rgb(from currentColor r g b / 12.5%)`,
        },
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

export const textFieldContent = style([
    fieldSurface,
    {
        width: FIELD_WIDTH,
        height: FIELD_HEIGHT,

        selectors: {
            [`&.${isStretched}`]: {
                height: "auto",
            },
        },
    },
]);

export const textFieldPlaceholder = style({
    display: "flex",
    alignItems: "center",
    height: "100%",
    color: `rgb(from currentColor r g b / 50%)`,
    fontSize: FIELD_FONT_SIZE,
    lineHeight: FIELD_LINE_HEIGHT,
    opacity: 0,
    transition: `opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isTopAligned}`]: {
            alignItems: "flex-start",
        },
        [`&.${isEmpty}`]: {
            opacity: 1,
        },
    },
});
