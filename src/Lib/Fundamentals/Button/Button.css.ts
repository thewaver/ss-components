import { style, styleVariants } from "@vanilla-extract/css";

export const buttonError = style({});
export const buttonPressed = style({});

export const buttonSizingVariants = styleVariants({
    "fit-content": {
        width: "fit-content",
    },
    "fill": {
        width: "100%",
    },
});

export const buttonRoot = style({
    position: "relative",
    pointerEvents: "none",
    userSelect: "none",

    selectors: {
        [`&:not([disabled]).${buttonPressed}, &:not([disabled]):focus-visible`]: {
            zIndex: 1,
        },
        "&:not([disabled]):hover": {
            zIndex: 2,
        },
    },
});

export const buttonElement = style({
    appearance: "none",
    background: "transparent",
    margin: 0,
    padding: 0,
    border: "none",
    color: "inherit !important",
    fontSize: "inherit !important",
    fontWeight: "inherit !important",
    fontFamily: "inherit !important",
    lineHeight: "inherit !important",
    pointerEvents: "all",
    cursor: "pointer",
});

export const buttonCornersWrapper = style({
    position: "absolute",
    inset: 0,
});
