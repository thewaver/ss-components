import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const spotlightPopup = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.full,
    width: 280,
    color: themeVars.color.surface.contrast,
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.surface.dark}, ${themeVars.color.surface.light})`,
    borderRadius: themeVars.borderRadius.full,
    padding: themeVars.spacing.double,
    boxShadow: themeVars.shadow.large,
});

export const spotlightPopupTitle = style({
    fontWeight: "bold",
});

export const spotlightPopupText = style({
    fontSize: themeVars.fontSize.small,
    opacity: 0.85,
});

export const spotlightPopupActions = style({
    display: "flex",
    justifyContent: "space-between",
    gap: themeVars.spacing.full,
});
