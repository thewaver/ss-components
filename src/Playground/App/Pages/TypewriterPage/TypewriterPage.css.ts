import { style } from "@vanilla-extract/css";

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
});

export const textArea = style({
    minWidth: 320,
    minHeight: 160,
});

export const textHighlight = style({
    textTransform: "uppercase",
    lineHeight: 2,
});
