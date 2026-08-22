import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const OPTION_WIDTH = 52;
const OPTION_HEIGHT = 34;
const COLUMN_HEIGHT = OPTION_HEIGHT * 5;

export const isSelected = style({});
export const isNow = style({});
export const isHovered = style({});
export const isDisabled = style({});

export const clockOption = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: OPTION_WIDTH,
    height: OPTION_HEIGHT,
    borderRadius: themeVars.borderRadius.half,
    color: themeVars.color.surface.contrast,
    fontSize: themeVars.fontSize.small,
    fontVariantNumeric: "tabular-nums",
    transition: `background-color ${themeVars.animation.duration}, color ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}`]: {
            backgroundColor: `rgb(from ${themeVars.color.primary.main} r g b / 25%)`,
        },
        [`&.${isNow}`]: {
            boxShadow: `inset 0 0 0 1px ${themeVars.color.primary.main}`,
        },
        [`&.${isSelected}`]: {
            backgroundImage: `linear-gradient(215deg, ${themeVars.color.primary.light}, ${themeVars.color.primary.dark})`,
            color: themeVars.color.primary.contrast,
        },
        [`&.${isDisabled}`]: {
            opacity: 0.2,
        },
    },
});

export const clockUnit = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: OPTION_WIDTH,
    height: OPTION_HEIGHT,
    color: themeVars.color.surface.contrast,
    fontSize: themeVars.fontSize.xSmall,
    textTransform: "uppercase",
    opacity: 0.6,
});

export const clockColumn = style({
    display: "flex",
    flexDirection: "column",
    height: COLUMN_HEIGHT,
    overflowY: "auto",
    scrollbarWidth: "none",
});

export const clockFrame = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "fit-content",
    borderRadius: themeVars.borderRadius.full,
    padding: themeVars.spacing.full,
    backgroundImage: `linear-gradient(215deg, ${themeVars.color.surface.light}, ${themeVars.color.surface.dark})`,
    boxShadow: themeVars.shadow.medium,
});
