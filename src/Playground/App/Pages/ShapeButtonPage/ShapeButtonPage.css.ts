import { style } from "@vanilla-extract/css";

export const root = style({});

export const flexRow = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    gap: 20,
});
