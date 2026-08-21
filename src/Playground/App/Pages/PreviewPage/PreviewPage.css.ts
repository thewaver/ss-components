import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const paragraphs = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.full,
});

export const panel = style({
    borderRadius: 10,
    padding: themeVars.spacing.full,
    backgroundColor: themeVars.color.background.dark,
});

export const fade = style({
    height: 60,
    backgroundImage: `linear-gradient(to bottom, transparent, ${themeVars.color.background.dark})`,
});

export const scrollBox = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.full,
    height: 220,
    overflowY: "auto",
});

export const afterwards = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.full,
    opacity: 0.6,
});
