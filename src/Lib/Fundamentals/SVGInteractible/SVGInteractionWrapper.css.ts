import { style } from "@vanilla-extract/css";

export const svgInteractionWrapperRoot = style({
    cursor: "pointer",
    pointerEvents: "visiblePainted",

    selectors: {
        [`&:focus`]: {
            outline: "none",
        },
    },
});
