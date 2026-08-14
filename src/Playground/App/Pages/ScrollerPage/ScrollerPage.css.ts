import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const root = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.quad,
});

export const demo = style({
    width: 420,
    maxWidth: "100%",
});

export const chip = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    height: 32,
    paddingInline: themeVars.spacing.double,
    color: themeVars.color.surface.contrast,
    backgroundColor: `rgb(from ${themeVars.color.surface.contrast} r g b / 10%)`,
    borderRadius: themeVars.borderRadius.half,
    fontSize: themeVars.fontSize.small,
    whiteSpace: "nowrap",
});
