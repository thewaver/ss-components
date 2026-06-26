import { style } from "@vanilla-extract/css";

export const root = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    gap: 40,
});

export const valueList = style({
    display: "grid",
    gap: 10,
});

export const colorList = style({
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "start",
    gap: 10,
});

export const example = style({
    resize: "both",
    overflow: "auto",
    width: 360,
    height: 240,
});
