import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const examplesRoot = style({
    display: "grid",
    alignItems: "stretch",
    gap: themeVars.spacing.double,
    width: "100%",
    minWidth: 0,
});

export const exampleContainer = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "stretch",
    gap: themeVars.spacing.double,
    minWidth: 0,

    color: themeVars.color.surface.contrast,
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.surface.dark}, ${themeVars.color.surface.light})`,
    backdropFilter: "blur(10px)",
    boxShadow: themeVars.shadow.medium,
    borderRadius: themeVars.borderRadius.full,
    padding: themeVars.spacing.double,
});

export const exampleDemo = style({
    display: "contents",
});

export const exampleReadout = style({
    fontFamily: "monospace",
    fontSize: themeVars.fontSize.xSmall,
    textAlign: "center",
    overflowWrap: "anywhere",
    opacity: 0.75,
});

export const exampleTitle = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "start",
    gap: themeVars.spacing.double,
    width: "100%",
});
