import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const mosaicTile = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    boxSizing: "border-box",
    padding: themeVars.spacing.half,
    borderRadius: themeVars.borderRadius.half,
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.secondary.dark}, ${themeVars.color.secondary.light})`,
    color: themeVars.color.secondary.contrast,
    boxShadow: themeVars.shadow.small,
    fontSize: themeVars.fontSize.xSmall,
    overflow: "hidden",
});

export const mosaicTileName = style({
    fontSize: themeVars.fontSize.small,
    whiteSpace: "nowrap",
});

export const mosaicTileReading = style({
    opacity: 0.75,
});

export const mosaicLink = style({
    position: "relative",
    display: "block",
    overflow: "hidden",
    borderRadius: themeVars.borderRadius.half,
    transition: "transform 150ms ease",
    selectors: {
        "&:hover, &:focus-visible": {
            transform: "scale(1.08)",
            zIndex: 1,
        },
    },
});

export const mosaicCaption = style({
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    padding: themeVars.spacing.half,
    background: "rgba(0, 0, 0, 0.55)",
    color: themeVars.color.background.contrast,
    fontSize: themeVars.fontSize.xSmall,
    textAlign: "center",
});
