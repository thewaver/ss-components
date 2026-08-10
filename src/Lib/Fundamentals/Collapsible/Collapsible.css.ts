import { style, styleVariants } from "@vanilla-extract/css";

export const collapsibleSizingVariants = styleVariants({
    "fit-content": {
        width: "fit-content",
    },
    "fill": {
        width: "100%",
    },
});

export const collapsibleRoot = style({
    display: "flex",
    flexDirection: "column",
});

export const collapsibleTrigger = style({
    display: "flex",
    pointerEvents: "all",
    width: "100%",
    border: "none",
    padding: 0,
    background: "none",
    font: "inherit",
    color: "inherit",
    textAlign: "inherit",
});

export const collapsibleHeading = style({
    margin: 0,
    font: "inherit",
    color: "inherit",
});

export const collapsiblePanel = style({
    overflow: "hidden",
});
