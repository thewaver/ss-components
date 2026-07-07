import { createVar, style } from "@vanilla-extract/css";

export const backgroundColor = createVar();

export const root = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    gap: 40,
});

export const colorList = style({
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "start",
    gap: 10,
});

export const borderedContent = style({
    backgroundColor: `rgb(from ${backgroundColor} r g b / 50%)`,
    width: 240,
    height: 240,
    padding: 20,
});

export const borderedContentWide = style({
    backgroundColor: `rgb(from ${backgroundColor} r g b / 50%)`,
    resize: "both",
    overflow: "auto",
    width: 480,
    height: 240,
    padding: 20,
});
