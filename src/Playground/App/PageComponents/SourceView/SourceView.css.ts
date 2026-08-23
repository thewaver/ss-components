import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const SOURCE_VIEW_WIDTH = 1200;

export const sourceViewRoot = style({
    display: "flex",
    flexDirection: "column",
    width: SOURCE_VIEW_WIDTH,
    maxWidth: "100%",
    borderRadius: "inherit",
    overflowY: "auto",
});

export const sourceViewTabs = style({
    position: "sticky",
    top: 0,
    zIndex: 2,
    flexShrink: 0,
    paddingBlock: themeVars.spacing.double,
    marginInline: themeVars.spacing.double,
    backgroundColor: `rgba(from ${themeVars.color.surface.light} r g b / 25%)`,
    backdropFilter: "blur(10px)",
});

export const sourceViewPanel = style({
    paddingInline: themeVars.spacing.double,
    paddingBlockEnd: themeVars.spacing.double,
});
