import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isVisible = style({});

export const tooltipContent = style({
    color: themeVars.color.tooltip.contrast,
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.tooltip.dark}, ${themeVars.color.tooltip.light})`,
    backdropFilter: "blur(10px)",
    boxShadow: themeVars.shadow.medium,
    borderRadius: themeVars.borderRadius.full,
    padding: themeVars.spacing.full,

    maxWidth: 240,
    opacity: 0,

    selectors: {
        [`&.${isVisible}`]: {
            opacity: 1,
        },
    },
});
