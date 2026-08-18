import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const staircaseStep = style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: themeVars.spacing.full,
    padding: `${themeVars.spacing.half} ${themeVars.spacing.full}`,
    borderRadius: themeVars.borderRadius.half,
    backgroundImage: `linear-gradient(90deg, ${themeVars.color.primary.dark}, ${themeVars.color.secondary.dark})`,
    color: themeVars.color.background.contrast,
    fontSize: themeVars.fontSize.small,
    whiteSpace: "nowrap",
    overflow: "hidden",
});

export const staircaseStepIndent = style({
    fontSize: themeVars.fontSize.xSmall,
    opacity: 0.75,
});
