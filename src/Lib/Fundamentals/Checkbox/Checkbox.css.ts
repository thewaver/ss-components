import { style } from "@vanilla-extract/css";

export const checkboxElement = style({
    margin: 0,
    padding: 0,
    color: "inherit !important",
    accentColor: "currentColor",
    pointerEvents: "all",
    cursor: "pointer",

    selectors: {
        "&:disabled, &[aria-disabled='true']": {
            cursor: "not-allowed",
        },
    },
});
