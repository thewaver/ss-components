import { style } from "@vanilla-extract/css";

import { buttonElement } from "../../Button/Button.css";

const TAG_INPUT_FIELD_MIN_WIDTH = 60;

export const tagInputRoot = style({
    display: "flex",
    position: "relative",
    flexWrap: "wrap",
    alignItems: "center",
    width: "100%",
    pointerEvents: "all",
    cursor: "text",
});

export const tagInputTag = style([buttonElement, {}]);

export const tagInputField = style({
    flex: "1 0 100%",
    minWidth: TAG_INPUT_FIELD_MIN_WIDTH,
    margin: 0,
    padding: 0,
    border: "0 none",
    background: "none",
    color: "inherit",
    font: "inherit",
    pointerEvents: "all",
    userSelect: "text",
    cursor: "text",

    selectors: {
        "&:focus": {
            outline: "0 none",
        },
        "&[aria-disabled='true']": {
            caretColor: "transparent",
            cursor: "not-allowed",
        },
    },
});

export const tagInputPlaceholder = style({
    position: "absolute",
    pointerEvents: "none",
});
