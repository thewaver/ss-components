import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const propRoot = style({
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: themeVars.spacing.full,
    borderRadius: themeVars.borderRadius.half,
    padding: themeVars.spacing.full,
    width: "100%",

    color: themeVars.color.surface.contrast,
    backgroundColor: themeVars.color.surface.dark,
    boxShadow: themeVars.shadow.small,
});

export const propLabel = style({
    alignSelf: "center",
});
