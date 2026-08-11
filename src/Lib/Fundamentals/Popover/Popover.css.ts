import { style } from "@vanilla-extract/css";

export const popoverRoot = style({
    position: "absolute",
    top: 0,
    left: 0,
    pointerEvents: "all",
    outline: "none",

    selectors: {
        "&:focus, &:focus-visible": {
            outline: "none",
        },
    },
});
