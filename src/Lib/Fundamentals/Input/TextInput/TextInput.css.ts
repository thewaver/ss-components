import { style } from "@vanilla-extract/css";

export const textInputPlaceholder = style({
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
});

export const textInputAdornment = style({
    position: "absolute",
    top: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
});

export const textInputElement = style({
    appearance: "none",
    MozAppearance: "textfield",
    position: "absolute",
    inset: 0,
    width: "auto !important",
    height: "auto !important",
    minWidth: "0 !important",
    margin: "0 !important",
    border: "none !important",
    borderRadius: "0 !important",
    background: "transparent !important",
    boxShadow: "none !important",
    font: "inherit",
    color: "inherit",
    pointerEvents: "all",
    userSelect: "text",
    cursor: "text !important",

    selectors: {
        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            appearance: "none",
            margin: 0,
        },
        "&[aria-disabled='true']": {
            caretColor: "transparent !important",
            cursor: "not-allowed !important",
        },
    },
});
