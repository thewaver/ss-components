import { createVar, style, styleVariants } from "@vanilla-extract/css";

export const thumbSizeVar = createVar();

const thumbHitArea = {
    appearance: "none",
    width: thumbSizeVar,
    height: thumbSizeVar,
    border: "none",
    borderRadius: 0,
    background: "transparent",
    pointerEvents: "all",
} as const;

export const rangeElement = style({
    appearance: "none",
    position: "absolute",
    inset: 0,
    width: "auto !important",
    height: "auto !important",
    minWidth: "0 !important",
    margin: "0 !important",
    padding: "0 !important",
    border: "none !important",
    borderRadius: "0 !important",
    background: "transparent !important",
    boxShadow: "none !important",
    pointerEvents: "all",
    cursor: "pointer",

    selectors: {
        "&::-webkit-slider-runnable-track": {
            background: "transparent",
            border: "none",
        },
        "&::-moz-range-track": {
            background: "transparent",
            border: "none",
        },
        "&::-webkit-slider-thumb": thumbHitArea,
        "&::-moz-range-thumb": thumbHitArea,
        "&[aria-disabled='true']": {
            cursor: "not-allowed",
        },
    },
});

export const rangeOrientationVariants = styleVariants({
    horizontal: {},
    vertical: {
        writingMode: "vertical-lr",
        direction: "rtl",
    },
});
