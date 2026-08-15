import { style } from "@vanilla-extract/css";

export const radioGroupRoot = style({
    position: "relative",
    isolation: "isolate",
    display: "flex",
    alignItems: "flex-start",
    width: "fit-content",
});

export const radioGroupFloater = style({
    position: "absolute",
    zIndex: -1,

    display: "grid",
    transition: "width, height, left, top",
});
