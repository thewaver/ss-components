import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isHovered = style({});
export const isDisabled = style({});

export const numberInputStepper = style({
    display: "flex",
    flexDirection: "column",
    gap: 2,
});

export const numberInputStepperButton = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 14,
    borderRadius: themeVars.borderRadius.half,
    color: `rgb(from currentColor r g b / 60%)`,
    fontSize: 8,
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

export const numberInputStepperName = style({
    position: "absolute",
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    border: 0,
    clipPath: "inset(50%)",
    overflow: "hidden",
    whiteSpace: "nowrap",
});
