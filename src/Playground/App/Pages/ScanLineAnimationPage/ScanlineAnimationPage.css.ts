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
    maxWidth: 600,
});

export const imageContainer = style({
    width: 320,
});
