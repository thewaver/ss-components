import { style } from "@vanilla-extract/css";

export const buttonError = style({});

export const buttonSelected = style({});

export const buttonRoot = style({
    position: "relative",
    width: "fit-content",
    height: "fit-content",
    pointerEvents: "none",
    userSelect: "none",
});

export const buttonElement = style({
    appearance: "none",
    background: "transparent",
    margin: 0,
    padding: 0,
    border: "none",
    color: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    fontFamily: "inherit",
    lineHeight: "inherit",
    pointerEvents: "all",
    cursor: "pointer",
});

export const buttonCornersWrapper = style({
    position: "absolute",
    inset: 0,
});
