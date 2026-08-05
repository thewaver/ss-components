import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

export const demoRoot = style([
    pageStyles.panel,
    {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
    },
]);

export const demoLabel = style({
    fontSize: "0.75rem",
    fontWeight: "bold",
    textTransform: "uppercase",
});

export const demoReadout = style({
    fontFamily: "monospace",
    fontSize: "0.75rem",
    opacity: 0.75,
});
