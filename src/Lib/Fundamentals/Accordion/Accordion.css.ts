import { style, styleVariants } from "@vanilla-extract/css";

export const accordionSizingVariants = styleVariants({
    "fit-content": {
        width: "fit-content",
    },
    "fill": {
        width: "100%",
    },
});

export const accordionRoot = style({
    display: "flex",
    flexDirection: "column",
});

export const accordionSection = style({
    display: "flex",
    flexDirection: "column",
});

export const accordionHeader = style({
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

export const accordionHeading = style({
    margin: 0,
    font: "inherit",
    color: "inherit",
});

export const accordionPanel = style({
    overflow: "hidden",
});
