import { style } from "@vanilla-extract/css";

export const staircaseRoot = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "center",
    width: "100%",
});

export const staircaseStep = style({
    flexGrow: 0,
    flexShrink: 0,
});
