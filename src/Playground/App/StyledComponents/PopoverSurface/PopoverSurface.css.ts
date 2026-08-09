import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isVisible = style({});
export const isFlipped = style({});

export const popoverSurfaceEmpty = style({
    padding: themeVars.spacing.full,
    color: `rgb(from currentColor r g b / 50%)`,
    fontSize: themeVars.fontSize.medium,
    lineHeight: 1.25,
    whiteSpace: "nowrap",
});

export const popoverSurface = style({
    boxSizing: "border-box",
    width: "100%",
    maxHeight: 220,
    overflowY: "auto",
    padding: themeVars.spacing.half,
    color: themeVars.color.surface.contrast,
    boxShadow: themeVars.shadow.medium,
    border: `2px solid rgb(from currentColor r g b / 25%)`,
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: "black",
    opacity: 0,
    transform: "translateY(-4px)",

    selectors: {
        [`&.${isFlipped}`]: {
            transform: "translateY(4px)",
        },
        [`&.${isVisible}`]: {
            opacity: 1,
            transform: "translateY(0)",
        },
    },
});
