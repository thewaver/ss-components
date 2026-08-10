import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isHovered = style({});
export const isDisabled = style({});

export const meridiemToggle = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 28,
    height: 22,
    borderRadius: themeVars.borderRadius.half,
    color: `rgb(from currentColor r g b / 60%)`,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 0.5,
    lineHeight: 1,
    transition: `background-color ${themeVars.animation.duration}, color ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}`]: {
            color: "inherit",
            backgroundColor: `rgb(from currentColor r g b / 15%)`,
        },
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: themeVars.disabled.opacity,
        },
    },
});
