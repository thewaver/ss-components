import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const satelliteSubject = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: themeVars.spacing.full,
    borderRadius: themeVars.borderRadius.half,
    backgroundImage: `linear-gradient(135deg, ${themeVars.color.tooltip.dark}, ${themeVars.color.tooltip.light})`,
    color: themeVars.color.tooltip.contrast,
    fontSize: themeVars.fontSize.small,
    textAlign: "center",
});

export const satelliteBadge = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    backgroundColor: themeVars.color.primary.main,
    color: themeVars.color.primary.contrast,
    fontSize: themeVars.fontSize.xSmall,
    boxShadow: themeVars.shadow.small,
});

export const satelliteBadgeMuted = style({
    backgroundColor: themeVars.color.secondary.main,
    color: themeVars.color.secondary.contrast,
});
