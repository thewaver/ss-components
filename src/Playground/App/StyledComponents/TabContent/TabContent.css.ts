import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isSelected = style({});
export const isHovered = style({});
export const isDisabled = style({});
export const isVisible = style({});

const tabBase = style({
    whiteSpace: "nowrap",
    transition: `color ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}`]: {
            color: themeVars.color.primary.main,
        },
        [`&.${isSelected}`]: {
            color: themeVars.color.primary.main,
        },
        [`&.${isDisabled}`]: {
            opacity: themeVars.disabled.opacity,
            filter: themeVars.disabled.filter,
        },
    },
});

export const rowTab = style([
    tabBase,
    {
        paddingBlock: themeVars.spacing.half,
        paddingInline: themeVars.spacing.full,
        marginBlockEnd: themeVars.spacing.half,
        fontSize: themeVars.fontSize.xSmall,
        fontWeight: "bold",
    },
]);

export const columnTab = style([
    tabBase,
    {
        paddingBlock: themeVars.spacing.full,
        paddingInline: themeVars.spacing.double,
        fontSize: themeVars.fontSize.small,
        textAlign: "start",
    },
]);

export const rowTabGutter = style({
    borderBlockEnd: `2px solid rgb(from ${themeVars.color.surface.contrast} r g b / 25%)`,
});

export const rowTabFloater = style({
    borderBlockEnd: `2px solid ${themeVars.color.primary.main}`,
    transform: "scaleX(0)",
    transition: "transform",

    selectors: {
        [`&.${isVisible}`]: {
            transform: "scaleX(1)",
        },
    },
});

export const columnTabFloater = style({
    backgroundImage: `linear-gradient(to right, ${themeVars.color.primary.main} 3px, rgb(from ${themeVars.color.surface.contrast} r g b / 10%) 3px, transparent)`,
    width: "100%",
    height: "100%",
    opacity: 0,
    transition: "opacity",

    selectors: {
        [`&.${isVisible}`]: {
            opacity: 1,
        },
    },
});

export const tabPanel = style({
    borderRadius: themeVars.borderRadius.half,
    padding: themeVars.spacing.full,
    backgroundImage: `linear-gradient(215deg, ${themeVars.color.surface.dark}, ${themeVars.color.surface.dark})`,
    fontSize: themeVars.fontSize.small,
});
