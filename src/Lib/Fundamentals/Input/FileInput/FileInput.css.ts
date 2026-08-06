import { style } from "@vanilla-extract/css";

export const fileInputElement = style({
    position: "absolute",
    inset: 0,
    width: "auto !important",
    height: "auto !important",
    minWidth: "0 !important",
    margin: "0 !important",
    padding: "0 !important",
    border: "none !important",
    borderRadius: "0 !important",
    background: "transparent !important",
    boxShadow: "none !important",
    color: "transparent",
    pointerEvents: "all",
    cursor: "pointer",

    selectors: {
        "&::file-selector-button, &::-webkit-file-upload-button": {
            display: "none",
        },
        "&[aria-disabled='true']": {
            cursor: "not-allowed",
        },
    },
});
