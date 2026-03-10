import { style } from "@vanilla-extract/css";

export const buttonError = style({});

export const buttonSelected = style({});

export const buttonRoot = style({
    position: "relative",
    pointerEvents: "none",
    userSelect: "none",
});

export const buttonElement = style({
    appearance: "none",
    background: "transparent",
    margin: 0,
    padding: 0,
    width: "100%",
    height: "100%",
    color: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    fontFamily: "inherit",
    lineHeight: "inherit",
    pointerEvents: "all",
});

export const buttonCornersWrapper = style({
    position: "absolute",
    inset: 0,
});
