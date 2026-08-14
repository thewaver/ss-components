import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const SLIDE_BUTTON_THUMB_SIZE = 44;
export const SLIDE_BUTTON_WIDTH = 300;

export const isTracking = style({});
export const isFocused = style({});
export const isDisabled = style({});
export const hasError = style({});

export const slideButtonContent = style({
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: SLIDE_BUTTON_THUMB_SIZE,
    borderRadius: SLIDE_BUTTON_THUMB_SIZE / 2,
    backgroundColor: `rgb(from currentColor r g b / 15%)`,
    boxShadow: themeVars.shadow.small,
    overflow: "hidden",
    transition: `filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: themeVars.disabled.opacity,
        },
    },
});

export const slideButtonFill = style({
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.primary.dark}, ${themeVars.color.primary.light})`,
    transition: `width ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isTracking}`]: {
            transition: "none",
        },
        [`.${hasError} &`]: {
            backgroundImage: `linear-gradient(45deg, ${themeVars.color.error.dark}, ${themeVars.color.error.light})`,
        },
    },
});

export const slideButtonHint = style({
    position: "relative",
    flex: 1,
    textAlign: "center",
    paddingInline: SLIDE_BUTTON_THUMB_SIZE,
    fontWeight: "bold",
    whiteSpace: "nowrap",
});

export const slideButtonThumb = style({
    position: "absolute",
    left: 0,
    top: 0,
    width: SLIDE_BUTTON_THUMB_SIZE,
    height: SLIDE_BUTTON_THUMB_SIZE,
    borderRadius: "50%",
    border: `2px solid ${themeVars.color.primary.main}`,
    backgroundColor: themeVars.color.background.dark,
    boxShadow: themeVars.shadow.small,
    cursor: "grab",
    transition: `left ${themeVars.animation.duration}, transform ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isTracking}`]: {
            transition: `transform ${themeVars.animation.duration}`,
            cursor: "grabbing",
        },
        [`&.${isFocused}`]: {
            transform: "scale(1.1)",
        },
        [`.${hasError} &`]: {
            borderColor: themeVars.color.error.main,
        },
    },
});

export const slideButtonArrow = style({
    display: "block",
    width: "100%",
    height: "100%",
    fill: "none",
    stroke: themeVars.color.primary.main,
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",

    selectors: {
        [`.${hasError} &`]: {
            stroke: themeVars.color.error.main,
        },
    },
});
