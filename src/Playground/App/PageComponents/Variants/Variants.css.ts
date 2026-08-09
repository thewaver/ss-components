import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const variantsRoot = style({
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: themeVars.spacing.double,
});

export const variantContainer = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: themeVars.spacing.full,

    color: themeVars.color.surface.contrast,
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.surface.dark}, ${themeVars.color.surface.light})`,
    backdropFilter: "blur(10px)",
    boxShadow: themeVars.shadow.medium,
    borderRadius: themeVars.borderRadius.full,
    padding: themeVars.spacing.double,
});

export const variantTitle = style({
    fontSize: themeVars.fontSize.xSmall,
    fontWeight: "bold",
    textTransform: "uppercase",
});

export const variantReadout = style({
    fontFamily: "monospace",
    fontSize: themeVars.fontSize.xSmall,
    opacity: 0.75,
});
