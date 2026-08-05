import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

const FIELD_WIDTH = 240;
const FIELD_HEIGHT = 40;
const FIELD_BORDER = 2;

export const FIELD_PADDING = 10 + FIELD_BORDER;
export const FIELD_GAP = 6;
export const FIELD_FONT_SIZE = "1rem";
export const FIELD_LINE_HEIGHT = 1.25;

export const isEmpty = style({});
export const isHovered = style({});
export const isReadOnly = style({});

export const textInputContent = style({
    width: FIELD_WIDTH,
    height: FIELD_HEIGHT,
    boxShadow: "var(--shd-tiny)",
    border: `${FIELD_BORDER}px solid rgba(from var(--clr-text) r g b / 25%)`,
    borderRadius: 5,
    backgroundColor: "black",
    transition: "filter var(--anim-duration), opacity var(--anim-duration), border-color var(--anim-duration)",

    selectors: {
        [`&.${isReadOnly}`]: {
            backgroundColor: "rgba(from var(--clr-text) r g b / 10%)",
        },
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

export const textInputPlaceholder = style({
    display: "flex",
    alignItems: "center",
    height: "100%",
    color: "rgba(from var(--clr-text) r g b / 40%)",
    fontSize: FIELD_FONT_SIZE,
    lineHeight: FIELD_LINE_HEIGHT,
    opacity: 0,
    transition: "opacity var(--anim-duration)",

    selectors: {
        [`&.${isEmpty}`]: {
            opacity: 1,
        },
    },
});
