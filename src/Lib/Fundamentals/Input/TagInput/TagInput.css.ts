import { style } from "@vanilla-extract/css";

import { buttonElement } from "../../Button/Button.css";

export const tagInputRoot = style({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    width: "100%",
});

export const tagInputTag = style([buttonElement, {}]);

export const tagInputField = style({
    flex: "1 1 auto",
    minWidth: 60,
    margin: 0,
    padding: 0,
    border: "0 none",
    background: "none",
    color: "inherit",
    font: "inherit",

    selectors: {
        "&:focus": {
            outline: "0 none",
        },
    },
});

export const tagInputPlaceholder = style({
    position: "absolute",
    pointerEvents: "none",
});
