import { style } from "@vanilla-extract/css";

import { buttonElement } from "../Button/Button.css";

export const breadcrumbsRoot = style({
    display: "flex",
});

export const breadcrumbsList = style({
    display: "flex",
    alignItems: "center",
    margin: 0,
    padding: 0,
    listStyle: "none",
});

export const breadcrumbsEntry = style({
    display: "flex",
    alignItems: "center",
});

export const breadcrumbsSeparator = style({
    display: "flex",
    alignItems: "center",
});

export const breadcrumbsItem = style([buttonElement, {}]);
