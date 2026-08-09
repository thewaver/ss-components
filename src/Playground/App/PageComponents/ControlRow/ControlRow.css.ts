import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const controlRow = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.double,
});

export const controlRowLabel = style({
    opacity: 0.5,
    fontSize: themeVars.fontSize.tiny,
    textTransform: "uppercase",
});
