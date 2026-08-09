import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const modalPanel = style({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: themeVars.spacing.double,
    color: themeVars.color.surface.contrast,
    backgroundImage: `linear-gradient(215deg, ${themeVars.color.surface.light}, ${themeVars.color.surface.dark})`,
    backdropFilter: "brightness(75%) grayscale(25%) blur(10px)",
    boxShadow: themeVars.shadow.large,
    borderRadius: themeVars.borderRadius.half,
    padding: themeVars.spacing.double,
});

export const modalPanelOn = style([modalPanel, { transform: "scale(1)" }]);

export const modalPanelOff = style([modalPanel, { transform: "scale(0)" }]);

export const modalHint = style({
    pointerEvents: "none",
    userSelect: "none",
    textTransform: "uppercase",
});
