import { style } from "@vanilla-extract/css";

export const treeNode = style({
    width: "100%",
    cursor: "pointer",
    pointerEvents: "all",

    selectors: {
        "&[aria-disabled='true']": {
            cursor: "not-allowed",
        },
    },
});

export const treeSizer = style({
    position: "relative",
    width: "100%",
});

export const treeSizerRow = style({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
});
