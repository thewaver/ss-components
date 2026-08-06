import { style, styleVariants } from "@vanilla-extract/css";

export const progressSizingVariants = styleVariants({
    "fit-content": {
        width: "fit-content",
    },
    "fill": {
        width: "100%",
    },
});

export const progressRoot = style({
    display: "flex",
});
