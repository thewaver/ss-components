import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const selectGroupContent = style({
    padding: `${themeVars.spacing.full} ${themeVars.spacing.full} ${themeVars.spacing.half}`,
    color: `rgb(from currentColor r g b / 50%)`,
    fontSize: themeVars.fontSize.xSmall,
    lineHeight: 1.25,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
});
