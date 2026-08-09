import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const TRIGGER_CHEVRON_WIDTH = 10;

export const isHovered = style({});
export const isActive = style({});
export const isOpen = style({});
export const isDisabled = style({});

export const menuTriggerContent = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.full,
    boxSizing: "border-box",
    height: 40,
    color: themeVars.color.primary.contrast,
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.primary.dark}, ${themeVars.color.primary.light})`,
    borderRadius: themeVars.borderRadius.half,
    paddingInline: themeVars.spacing.double,
    boxShadow: themeVars.shadow.small,
    fontWeight: "bold",
    whiteSpace: "nowrap",
    transition: `filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
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

export const menuTriggerChevron = style({
    flexShrink: 0,
    width: 0,
    height: 0,
    borderLeft: `${TRIGGER_CHEVRON_WIDTH / 2}px solid transparent`,
    borderRight: `${TRIGGER_CHEVRON_WIDTH / 2}px solid transparent`,
    borderTop: "6px solid currentColor",
    transition: `transform ${themeVars.animation.duration}`,

    selectors: {
        [`${menuTriggerContent}.${isOpen} &`]: {
            transform: "rotate(180deg)",
        },
    },
});
