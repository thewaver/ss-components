import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const dateRangeRow = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.half,
});

export const dateRangeSeparator = style({
    color: themeVars.color.surface.contrast,
    fontSize: themeVars.fontSize.small,
    opacity: 0.6,
});
