import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const controlRow = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.double,
});

export const controlColumn = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: themeVars.spacing.full,
});

export const controlRowLabel = style({
    opacity: 0.5,
    fontSize: themeVars.fontSize.xSmall,
    textTransform: "uppercase",
});
