import { style } from "@vanilla-extract/css";

import { buttonElement } from "../Button/Button.css";

export const tabsRoot = style({
    position: "relative",
    display: "flex",
});

export const tabsFloater = style({
    position: "absolute",
    zIndex: -1,
    transition: "width, height, left, top",
});

export const tabsItem = style([buttonElement, {}]);
