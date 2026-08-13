import { style } from "@vanilla-extract/css";

export const selectField = style({
    appearance: "none",
    background: "transparent",
    width: "100%",
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

    selectors: {
        "&[aria-disabled='true']": {
            cursor: "not-allowed",
        },
    },
});

export const selectFilterField = style({
    appearance: "none",
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
        "&[aria-disabled='true']": {
            caretColor: "transparent !important",
            cursor: "not-allowed !important",
        },
    },
});

export const selectEndMarker = style({
    width: "100%",
    height: 1,
    marginTop: -1,
});

export const selectSizer = style({
    position: "relative",
    width: "100%",
});

export const selectSizerRow = style({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
});

export const selectOption = style({
    width: "100%",
    cursor: "pointer",
    pointerEvents: "all",

    selectors: {
        "&[aria-disabled='true']": {
            cursor: "not-allowed",
        },
    },
});
