import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const HOST_SIZE = 400;

export const root = style({
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: themeVars.spacing.double,
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
    maxWidth: `calc(${HOST_SIZE}px + ${themeVars.spacing.double} * 2)`,
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
