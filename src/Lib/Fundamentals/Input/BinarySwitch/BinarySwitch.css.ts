import { style } from "@vanilla-extract/css";

export const binarySwitchElement = style({
    appearance: "none",
    position: "absolute",
    inset: 0,
    width: "auto !important",
    height: "auto !important",
    margin: "0 !important",
    padding: "0 !important",
    border: "none !important",
    borderRadius: "0 !important",
    background: "transparent !important",
    boxShadow: "none !important",
    pointerEvents: "all",
    cursor: "pointer",

    selectors: {
        "&[aria-disabled='true']": {
            cursor: "not-allowed",
        },
    },
});
