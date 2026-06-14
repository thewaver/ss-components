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

export const stressContainer = style({
    display: "grid",
    gridTemplateColumns: "repeat(20, auto)",
    gap: 10,
});

export const borderedContentSmall = style({
    width: 80,
    height: 80,
});

export const borderedContent = style({
    width: 240,
    height: 240,
});

export const borderedContentWide = style({
    resize: "both",
    overflow: "auto",
    width: 480,
    height: 240,
});
