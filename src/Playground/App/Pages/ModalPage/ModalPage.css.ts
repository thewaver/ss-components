import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const root = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.double,
});

export const buttons = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "start",
    gap: themeVars.spacing.double,
    marginTop: themeVars.spacing.double,
});
