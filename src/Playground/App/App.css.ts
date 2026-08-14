import { style } from "@vanilla-extract/css";

import { themeVars } from "./Theme.css";

export const isVisible = style({});
export const isSelected = style({});

export const appRoot = style({
    position: "relative",
    width: "100%",
    height: "100vh",
    overflow: "hidden",
});

export const appContent = style({
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gridTemplateRows: "minmax(0, 1fr)",
    width: "100%",
    height: "100%",
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.background.dark}, ${themeVars.color.background.light})`,
});

export const leftMenu = style({
    color: themeVars.color.surface.contrast,
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.surface.dark}, ${themeVars.color.surface.light})`,
    backdropFilter: "blur(10px)",
    boxShadow: themeVars.shadow.large,
    width: 240,
    padding: themeVars.spacing.full,
    overflowY: "auto",
});

export const searchContainer = style({
    width: "100%",
    padding: themeVars.spacing.full,
});

export const menuSection = style({
    display: "flex",
    flexDirection: "column",
});

export const menuCategory = style({
    margin: 0,
    padding: themeVars.spacing.full,
    fontSize: themeVars.fontSize.xSmall,
    fontWeight: "bold",
    textAlign: "start",
    textTransform: "uppercase",
    opacity: 0.5,
});

export const tabItem = style({
    paddingBlock: themeVars.spacing.full,
    paddingInline: themeVars.spacing.double,
    textAlign: "start",
    transition: `color ${themeVars.animation.duration}`,

    selectors: {
        "&:hover": {
            color: themeVars.color.primary.main,
        },
        [`&.${isSelected}`]: {
            color: themeVars.color.primary.main,
        },
    },
});

export const tabFloater = style({
    backgroundImage: `linear-gradient(to right, ${themeVars.color.primary.main} 5px, hsl(from ${themeVars.color.surface.light} h s calc(l * 1.5)) 5px, transparent)`,
    width: "100%",
    height: "100%",
    opacity: 0,
    transition: "opacity",

    selectors: {
        [`&.${isVisible}`]: {
            opacity: 1,
        },
    },
});

export const tabPage = style({
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: themeVars.spacing.quad,
    overflowY: "auto",
});

export const tabPanelBody = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.quad,
});

export const tabPageHeader = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.full,
});

export const tabPageTitle = style({
    fontSize: themeVars.fontSize.large,
});

export const tabPageDescription = style({
    fontSize: themeVars.fontSize.small,
    maxWidth: 960,
    opacity: 0.75,
});
