import { style } from "@vanilla-extract/css";

export const optionButton = style({
    width: "100%",
});

export const fpsCounter = style({
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,

    backgroundColor: "black",
    padding: 20,
    whiteSpace: "pre",
});
