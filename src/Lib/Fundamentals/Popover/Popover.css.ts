import { style } from "@vanilla-extract/css";

export const popoverRoot = style({
    position: "absolute",
    pointerEvents: "all",
    outline: "none",

    selectors: {
        "&:focus, &:focus-visible": {
            outline: "none",
        },
    },
});
