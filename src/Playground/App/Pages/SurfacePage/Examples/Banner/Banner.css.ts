import { style } from "@vanilla-extract/css";

export const borderRadius = 20;

export const root = style({
    width: 400,
    borderRadius,
    boxShadow: "var(--shd-tiny)",
});

export const content = style({
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    padding: 20,
    whiteSpace: "pre-wrap",
});

export const image = style({
    height: 40,
});
