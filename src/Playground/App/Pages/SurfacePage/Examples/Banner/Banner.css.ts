import { style } from "@vanilla-extract/css";

import { themeVars } from "../../../../Theme.css";

export const borderRadius = 20;

export const root = style({
    width: 400,
    borderRadius,
    boxShadow: themeVars.shadow.small,
});

export const content = style({
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    gap: themeVars.spacing.full,
    padding: themeVars.spacing.double,
    whiteSpace: "pre-wrap",
});

export const image = style({
    height: 40,
});
