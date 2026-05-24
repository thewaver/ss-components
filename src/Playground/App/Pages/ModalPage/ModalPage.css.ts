import { style } from "@vanilla-extract/css";

export const root = style({
    display: "flex",
    flexDirection: "column",
    gap: 20,
});

export const buttons = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "start",
    gap: 20,
    marginTop: 20,
});
