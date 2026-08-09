import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const MIN_COLUMN_WIDTH = 320;

export const variantsRoot = style({
    display: "grid",
    gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${MIN_COLUMN_WIDTH}px), 1fr))`,
    alignItems: "stretch",
    gap: themeVars.spacing.double,
});

export const variantContainer = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: themeVars.spacing.full,
    minWidth: 0,

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

export const variantDemo = style({
    display: "flex",
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    gap: themeVars.spacing.full,
    minWidth: 0,
});

export const variantReadout = style({
    fontFamily: "monospace",
    fontSize: themeVars.fontSize.xSmall,
    textAlign: "center",
    overflowWrap: "anywhere",
    opacity: 0.75,
});
