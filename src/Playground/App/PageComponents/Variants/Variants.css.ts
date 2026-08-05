import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

export const variantsRoot = style({
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: 40,
});

export const variantContainer = style([
    pageStyles.panel,
    {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
    },
]);

export const variantTitle = style({
    fontSize: "0.75rem",
    fontWeight: "bold",
    textTransform: "uppercase",
});

export const variantReadout = style({
    fontFamily: "monospace",
    fontSize: "0.75rem",
    opacity: 0.75,
});
