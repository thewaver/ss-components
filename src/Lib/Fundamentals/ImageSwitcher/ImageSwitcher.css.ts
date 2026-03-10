import { style } from "@vanilla-extract/css";

export const imageSwitcherRoot = style({
    position: "relative",
    width: "100%",
    height: "100%",
});

export const imageSwitcherImage = style({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "cover",
    objectPosition: "center center",
    transitionProperty: "opacity",
});
