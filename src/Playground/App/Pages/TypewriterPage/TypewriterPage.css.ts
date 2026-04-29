import { style } from "@vanilla-extract/css";

export const root = style({});

export const container = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    gap: 20,
    maxWidth: 600,
});

export const textContent = style({
    padding: 20,
    whiteSpace: "pre-wrap",
});

export const textHighlight = style({
    textTransform: "uppercase",
    lineHeight: 2,
});
