import { style } from "@vanilla-extract/css";

export const colorInputElement = style({
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
        /**
         * Hidden rather than made transparent: the UA paints the current colour onto the swatch through
         * a path an author `background` does not reach, so a transparent one still covers the painter
         * with a solid rectangle. `visibility` takes the swatch subtree out of paint and leaves the
         * input's own outline alone, which is what keeps the focus ring around the painted box.
         */
        "&::-webkit-color-swatch-wrapper": {
            padding: 0,
        },
        "&::-webkit-color-swatch": {
            visibility: "hidden",
        },
        "&::-moz-color-swatch": {
            visibility: "hidden",
        },
        "&[aria-disabled='true']": {
            cursor: "not-allowed",
        },
    },
});
