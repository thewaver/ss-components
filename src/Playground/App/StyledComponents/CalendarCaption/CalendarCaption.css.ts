import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const calendarCaptionFields = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.half,
});
