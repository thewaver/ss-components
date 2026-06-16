import { style } from "@vanilla-extract/css";

export const fpsCounter = style({
    position: "absolute",
    top: -20,
    right: -20,
    zIndex: 10,

    backgroundColor: "black",
    padding: 20,
    whiteSpace: "pre",
});
