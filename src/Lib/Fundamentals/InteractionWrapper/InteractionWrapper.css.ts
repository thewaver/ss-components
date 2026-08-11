import { globalStyle, style, styleVariants } from "@vanilla-extract/css";

export const interactionDisabled = style({});
export const interactionError = style({});
export const interactionPressed = style({});

export const interactionSizingVariants = styleVariants({
    "fit-content": {
        width: "fit-content",
    },
    "fill": {
        width: "100%",
    },
});

export const interactionRoot = style({
    display: "flex",
    position: "relative",
    maxWidth: "100%",
    pointerEvents: "none",
    userSelect: "none",

    selectors: {
        [`&:not(.${interactionDisabled}).${interactionPressed}, &:not(.${interactionDisabled}):has(:focus-visible)`]: {
            zIndex: 1,
        },
        [`&:not(.${interactionDisabled}):hover`]: {
            zIndex: 2,
        },
    },
});

export const interactionDecorationWrapper = style({
    position: "absolute",
    inset: 0,
});

globalStyle(`${interactionRoot} > *`, {
    margin: "0 !important",
});
