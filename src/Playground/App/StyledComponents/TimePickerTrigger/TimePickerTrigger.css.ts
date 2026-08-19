import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isHovered = style({});
export const isOpen = style({});
export const isDisabled = style({});

export const timePickerTrigger = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 22,
    height: 22,
    borderRadius: themeVars.borderRadius.half,
    color: `rgb(from currentColor r g b / 60%)`,
    fontSize: 11,
    lineHeight: 1,
    transition: `background-color ${themeVars.animation.duration}, color ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}, &.${isOpen}`]: {
            color: "inherit",
            backgroundColor: `rgb(from currentColor r g b / 15%)`,
        },
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: themeVars.disabled.opacity,
        },
    },
});
