import { style, styleVariants } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isCurrent = style({});
export const isHovered = style({});
export const isDisabled = style({});

export const rowStep = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.full,
    padding: themeVars.spacing.half,
    borderRadius: themeVars.borderRadius.half,
    fontSize: themeVars.fontSize.small,
    whiteSpace: "nowrap",
    transition: `filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isCurrent}`]: {
            fontWeight: "bold",
        },
        [`&.${isHovered}`]: {
            filter: themeVars.hover.filter,
        },
        [`&.${isDisabled}`]: {
            opacity: themeVars.disabled.opacity,
        },
    },
});

export const columnStep = style([rowStep, { width: "100%" }]);

const markerBase = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    width: 28,
    height: 28,
    borderRadius: "50%",
    fontSize: themeVars.fontSize.xSmall,
    transition: `background-color ${themeVars.animation.duration}, box-shadow ${themeVars.animation.duration}`,
} as const;

export const marker = styleVariants({
    done: [
        {
            ...markerBase,
            backgroundImage: `radial-gradient(circle at 70% 30%, ${themeVars.color.success.light}, ${themeVars.color.success.dark})`,
            color: themeVars.color.success.contrast,
        },
    ],
    current: [
        {
            ...markerBase,
            backgroundImage: `radial-gradient(circle at 70% 30%, ${themeVars.color.primary.light}, ${themeVars.color.primary.dark})`,
            color: themeVars.color.primary.contrast,
            boxShadow: `0 0 0 3px rgb(from ${themeVars.color.primary.main} r g b / 35%)`,
        },
    ],
    failed: [
        {
            ...markerBase,
            backgroundImage: `radial-gradient(circle at 70% 30%, ${themeVars.color.error.light}, ${themeVars.color.error.dark})`,
            color: themeVars.color.error.contrast,
        },
    ],
    skipped: [
        {
            ...markerBase,
            backgroundImage: `radial-gradient(circle at 70% 30%, ${themeVars.color.alert.light}, ${themeVars.color.alert.dark})`,
            color: themeVars.color.alert.contrast,
        },
    ],
    ahead: [
        {
            ...markerBase,
            backgroundColor: "transparent",
            border: `2px solid rgb(from currentColor r g b / 25%)`,
        },
    ],
});

export const rowConnector = style({
    width: 32,
    height: 2,
    backgroundColor: `rgb(from currentColor r g b / 25%)`,
});

export const columnConnector = style({
    width: 2,
    height: 20,
    marginInlineStart: 19,
    backgroundColor: `rgb(from currentColor r g b / 25%)`,
});
