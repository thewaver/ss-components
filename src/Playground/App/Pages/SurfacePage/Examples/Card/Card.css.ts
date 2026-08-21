import { style } from "@vanilla-extract/css";

import { themeVars } from "../../../../Theme.css";

export const borderRadius = 20;

export const root = style({
    width: 400,
    borderRadius,
    boxShadow: themeVars.shadow.small,
});

export const surfaceRoot = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
});

export const content = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: themeVars.spacing.full,
    whiteSpace: "pre-wrap",
    padding: themeVars.spacing.double,
});

export const pic = style({
    position: "relative",
    zIndex: 0,
});

export const picContent = style([
    content,
    {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,

        backgroundImage: `linear-gradient(to bottom, transparent, ${themeVars.color.primary.contrast} 80%)`,
        paddingBottom: themeVars.spacing.full,
    },
]);

export const surfaceCntent = style([
    content,
    {
        paddingTop: themeVars.spacing.full,
    },
]);

export const name = style({
    fontSize: "2rem",
    fontWeight: 700,
});

export const role = style({
    fontSize: "1.25rem",
    fontWeight: 500,
});

export const bios = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.full,
});

export const bioFade = style({
    height: 60,
    backgroundImage: `linear-gradient(to bottom, transparent, ${themeVars.color.primary.contrast})`,
});

export const bio = style({
    fontSize: themeVars.fontSize.medium,
    fontWeight: 400,
    color: `rgb(from currentColor r g b / 75%)`,
});
