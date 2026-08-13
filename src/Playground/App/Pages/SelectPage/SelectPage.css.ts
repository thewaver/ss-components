import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const column = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: themeVars.spacing.full,
    width: "100%",
});
