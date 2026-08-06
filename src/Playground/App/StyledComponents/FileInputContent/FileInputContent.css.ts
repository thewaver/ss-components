import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

const FIELD_WIDTH = 280;
const FIELD_BORDER = 2;
const FIELD_PADDING = 10;

export const isHovered = style({});
export const isEmpty = style({});

export const fileInputContent = style({
    display: "flex",
    flexDirection: "column",
    gap: 4,
    width: FIELD_WIDTH,
    padding: FIELD_PADDING,
    boxShadow: "var(--shd-tiny)",
    border: `${FIELD_BORDER}px dashed rgba(from var(--clr-text) r g b / 25%)`,
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

export const fileInputPrompt = style({
    fontSize: "0.875rem",
    fontWeight: 600,
});

export const fileInputNames = style({
    fontSize: "0.75rem",
    lineHeight: 1.4,
    color: "rgba(from var(--clr-text) r g b / 60%)",
    overflowWrap: "anywhere",

    selectors: {
        [`&.${isEmpty}`]: {
            fontStyle: "italic",
        },
    },
});
