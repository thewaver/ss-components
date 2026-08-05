import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

export const examplesRoot = style({
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "start",
    alignItems: "stretch",
    gap: 40,
});

export const exampleContainer = style([
    pageStyles.panel,
    {
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "stretch",
        gap: 20,
    },
]);

export const exampleTitle = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "start",
    gap: 20,
    width: "100%",
});
