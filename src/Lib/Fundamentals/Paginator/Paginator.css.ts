import { style } from "@vanilla-extract/css";

import { buttonElement } from "../Button/Button.css";

export const paginatorRoot = style({
    display: "flex",
    alignItems: "center",
});

export const paginatorItem = style([buttonElement, {}]);

export const paginatorGap = style({
    display: "grid",
});
