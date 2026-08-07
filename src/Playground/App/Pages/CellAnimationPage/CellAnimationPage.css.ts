import { style } from "@vanilla-extract/css";

export const root = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    gap: 40,
});

export const exampleRoot = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "start",
    flexWrap: "wrap",
    gap: 20,
});

export const valueList = style({
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
});
