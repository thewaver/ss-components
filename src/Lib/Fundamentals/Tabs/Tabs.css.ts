import { globalStyle, style } from "@vanilla-extract/css";

import { tabItem } from "../../../Playground/App/App.css";
import { buttonElement } from "../Button/Button.css";

export const tabsRoot = style({
    position: "relative",
    display: "flex",
});

export const tabsGutter = style({
    position: "absolute",
    inset: 0,
    zIndex: -1,

    display: "grid",
});

export const tabsFloater = style({
    position: "absolute",
    zIndex: -1,

    display: "grid",
    transition: "width, height, left, top",
});

export const tabsItem = style([buttonElement, {}]);
