import { createVar, style } from "@vanilla-extract/css";

export const backgroundColor = createVar();

export const root = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    gap: 40,
});

export const container = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    gap: 20,
    maxWidth: 600,
});

export const colorList = style({
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "start",
    gap: 10,
});

export const borderedContainer = style({
    backgroundColor: `rgb(from ${backgroundColor} r g b / 50%)`,
});

export const borderedContent = style({
    width: 240,
    height: 240,
    padding: 20,
});

export const borderedContentWide = style({
    width: 480,
    height: 240,
    padding: 20,
});
