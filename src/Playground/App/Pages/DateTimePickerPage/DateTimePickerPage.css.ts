import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const dateTimeRow = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.half,
});

export const dateTimeSeparator = style({
    paddingInline: themeVars.spacing.half,
    color: themeVars.color.surface.contrast,
    fontSize: themeVars.fontSize.small,
    opacity: 0.6,
});
