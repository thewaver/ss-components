import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

const FIELD_BORDER = 2;
const SWATCH_SIZE = 24;

export const isHovered = style({});

export const colorInputContent = style({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 8,
    boxShadow: "var(--shd-tiny)",
    border: `${FIELD_BORDER}px solid rgba(from var(--clr-text) r g b / 25%)`,
    borderRadius: 5,
    backgroundColor: "black",
    transition: "filter var(--anim-duration), opacity var(--anim-duration), border-color var(--anim-duration)",

    selectors: {
        [`&.${pageStyles.hasError}`]: {
            borderColor: "var(--clr-error)",
        },
        [`&.${isHovered}`]: {
            filter: "brightness(120%)",
        },
        [`&.${pageStyles.isDisabled}`]: {
            filter: "grayscale(1)",
            opacity: 0.5,
        },
    },
});

export const colorInputSwatch = style({
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: 4,
    boxShadow: "inset 0 0 0 1px rgba(from var(--clr-text) r g b / 30%)",
});

export const colorInputValue = style({
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    textTransform: "uppercase",
});
