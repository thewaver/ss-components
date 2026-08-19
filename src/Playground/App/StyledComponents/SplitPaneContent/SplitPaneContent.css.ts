import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const FRAME_MAX_WIDTH = 380;

export const isDragging = style({});
export const isDisabled = style({});

const gutterBase = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: `rgb(from currentColor r g b / 15%)`,
    transition: `background-color ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isDragging}`]: {
            backgroundColor: themeVars.color.primary.main,
        },
        [`&.${isDisabled}`]: {
            opacity: themeVars.disabled.opacity,
        },
    },
} as const;

export const rowGutter = style({ ...gutterBase, width: "100%", height: "100%" });

export const columnGutter = style({ ...gutterBase, width: "100%", height: "100%" });

export const gutterGrip = style({
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: themeVars.color.background.contrast,
    opacity: 0.5,
});

export const rowGrip = style([gutterGrip, { width: 2, height: 24 }]);

export const columnGrip = style([gutterGrip, { width: 24, height: 2 }]);

export const splitPaneBox = style({
    width: "100%",
    height: "100%",
    padding: themeVars.spacing.full,
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: themeVars.color.surface.dark,
    fontSize: themeVars.fontSize.small,
    overflow: "auto",
});

export const splitPaneFrame = style({
    width: "100%",
    maxWidth: FRAME_MAX_WIDTH,
    height: 220,
    padding: themeVars.spacing.half,
    border: `1px solid rgb(from currentColor r g b / 25%)`,
    borderRadius: themeVars.borderRadius.full,
    backgroundColor: themeVars.color.background.dark,
});
