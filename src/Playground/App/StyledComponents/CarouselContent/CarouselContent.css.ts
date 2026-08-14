import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isCurrent = style({});
export const isHovered = style({});
export const isActive = style({});
export const isDisabled = style({});

export const carouselSlide = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: themeVars.spacing.half,
    height: 140,
    borderRadius: themeVars.borderRadius.half,
    backgroundImage: `linear-gradient(135deg, ${themeVars.color.tooltip.dark}, ${themeVars.color.tooltip.light})`,
    color: themeVars.color.tooltip.contrast,
});

export const carouselSlideTitle = style({
    fontSize: themeVars.fontSize.large,
});

export const carouselSlideBody = style({
    fontSize: themeVars.fontSize.xSmall,
    opacity: 0.75,
});

export const carouselBar = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: themeVars.spacing.half,
});

const controlBase = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: themeVars.color.surface.contrast,
    backgroundColor: `rgb(from ${themeVars.color.surface.contrast} r g b / 10%)`,
    borderRadius: themeVars.borderRadius.half,
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

export const carouselButton = style([
    controlBase,
    {
        width: 28,
        height: 28,
        fontSize: themeVars.fontSize.small,
    },
]);

export const carouselPick = style([
    controlBase,
    {
        width: 10,
        height: 10,
        borderRadius: "50%",

        selectors: {
            [`&.${isCurrent}`]: {
                backgroundColor: themeVars.color.primary.main,
            },
        },
    },
]);
