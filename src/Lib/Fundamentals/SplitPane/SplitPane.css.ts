import { style } from "@vanilla-extract/css";

export const splitPaneRoot = style({
    display: "grid",
    width: "100%",
    height: "100%",
});

export const splitPanePane = style({
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
});

export const splitPaneGutter = style({
    display: "grid",
    padding: 0,
    border: "0 none",
    background: "none",
    color: "inherit",
    font: "inherit",

    selectors: {
        '&[aria-orientation="vertical"]': {
            cursor: "col-resize",
        },
        '&[aria-orientation="horizontal"]': {
            cursor: "row-resize",
        },
        "&[aria-disabled='true']": {
            cursor: "not-allowed",
        },
    },
});
