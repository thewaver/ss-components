import { style } from "@vanilla-extract/css";

import { themeVars } from "../../../../Theme.css";

export const width = 400;

export const root = style({
    width,
    borderRadius: width * 0.5,
    boxShadow: themeVars.shadow.small,
});
