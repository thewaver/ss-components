import { style } from "@vanilla-extract/css";

import { buttonElement } from "../Button/Button.css";

export const stepperList = style({
    display: "flex",
    alignItems: "stretch",
    maxWidth: "100%",
    margin: 0,
    padding: 0,
    listStyle: "none",
});

export const stepperEntry = style({
    display: "flex",
    alignItems: "stretch",
    minWidth: 0,
});

export const stepperConnector = style({
    display: "flex",
    alignItems: "center",
});

export const stepperItem = style([buttonElement, {}]);
