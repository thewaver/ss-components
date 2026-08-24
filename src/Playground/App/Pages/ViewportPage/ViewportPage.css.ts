import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const HOST_SIZE = 400;

const CARD_PADDING = 20;
const MIN_COLUMN_WIDTH = HOST_SIZE + CARD_PADDING * 2;

export const root = style({
    display: "grid",
    gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${MIN_COLUMN_WIDTH}px), 1fr))`,
    alignItems: "stretch",
    gap: themeVars.spacing.double,
    width: "100%",
    minWidth: 0,
});

export const section = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.full,
    color: themeVars.color.surface.contrast,
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.surface.dark}, ${themeVars.color.surface.light})`,
    boxShadow: themeVars.shadow.medium,
    borderRadius: themeVars.borderRadius.full,
    padding: themeVars.spacing.double,
    minWidth: 0,
});

export const sectionTitle = style({
    fontSize: themeVars.fontSize.xSmall,
    fontWeight: "bold",
    textTransform: "uppercase",
});

export const readout = style({
    fontFamily: "monospace",
    fontSize: themeVars.fontSize.xSmall,
    opacity: 0.75,
    overflowWrap: "anywhere",
});

export const controls = style({
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    alignItems: "center",
    gap: themeVars.spacing.full,
    maxWidth: HOST_SIZE,
});

export const host = style({
    alignSelf: "center",
    width: HOST_SIZE,
    height: HOST_SIZE,
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: `rgb(from ${themeVars.color.background.dark} r g b / 50%)`,
    outline: `1px dashed rgb(from ${themeVars.color.surface.contrast} r g b / 25%)`,
    outlineOffset: -1,
});

export const roamer = style({
    position: "absolute",
});

export const toastRaiser = style({
    position: "absolute",
    left: themeVars.spacing.half,
    bottom: themeVars.spacing.half,
});

export const cornerReadout = style({
    position: "absolute",
    right: themeVars.spacing.half,
    bottom: themeVars.spacing.half,
    pointerEvents: "none",
});

export const scrollBox = style({
    width: "100%",
    height: "100%",
    overflow: "auto",
    padding: themeVars.spacing.full,
});

export const scrollFiller = style({
    height: 240,
});
