import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isCurrent = style({});
export const isHovered = style({});
export const isActive = style({});
export const isDisabled = style({});

const cellBase = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 32,
    height: 32,
    paddingInline: themeVars.spacing.half,
    color: themeVars.color.surface.contrast,
    borderRadius: themeVars.borderRadius.half,
    fontSize: themeVars.fontSize.small,
    transition: `color ${themeVars.animation.duration}, filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}, background-color ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}`]: {
            color: themeVars.color.primary.main,
        },
        [`&.${isActive}`]: {
            filter: themeVars.active.filter,
        },
        [`&.${isDisabled}`]: {
            opacity: themeVars.disabled.opacity,
            filter: themeVars.disabled.filter,
        },
    },
});

export const paginatorPage = style([
    cellBase,
    {
        backgroundColor: `rgb(from ${themeVars.color.surface.contrast} r g b / 10%)`,

        selectors: {
            [`&.${isCurrent}`]: {
                color: themeVars.color.primary.contrast,
                backgroundImage: `linear-gradient(215deg, ${themeVars.color.primary.light}, ${themeVars.color.primary.dark})`,
            },
        },
    },
]);

export const paginatorStep = style([
    cellBase,
    {
        backgroundColor: `rgb(from ${themeVars.color.surface.contrast} r g b / 10%)`,
    },
]);

export const paginatorGap = style([
    cellBase,
    {
        opacity: 0.5,
    },
]);
