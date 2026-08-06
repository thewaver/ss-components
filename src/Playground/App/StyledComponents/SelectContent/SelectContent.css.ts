import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

const FIELD_WIDTH = 240;
const FIELD_HEIGHT = 40;
const FIELD_BORDER = 2;
const FIELD_BOX_PADDING = 10;

export const FIELD_PADDING = FIELD_BOX_PADDING + FIELD_BORDER;
export const FIELD_CHEVRON_WIDTH = 10;
export const FIELD_GAP = 10;
export const FIELD_FONT_SIZE = "1rem";
export const FIELD_LINE_HEIGHT = 1.25;

export const isEmpty = style({});
export const isFiltering = style({});
export const isHovered = style({});
export const isOpen = style({});

export const selectContent = style({
    display: "flex",
    alignItems: "center",
    gap: FIELD_GAP,
    boxSizing: "border-box",
    width: FIELD_WIDTH,
    height: FIELD_HEIGHT,
    padding: FIELD_BOX_PADDING,
    boxShadow: "var(--shd-tiny)",
    border: `${FIELD_BORDER}px solid rgba(from var(--clr-text) r g b / 25%)`,
    borderRadius: 5,
    backgroundColor: "black",
    color: "var(--clr-text)",
    fontSize: FIELD_FONT_SIZE,
    lineHeight: FIELD_LINE_HEIGHT,
    textAlign: "left",
    transition: "filter var(--anim-duration), opacity var(--anim-duration), border-color var(--anim-duration)",

    selectors: {
        [`&.${pageStyles.hasError}`]: {
            borderColor: "var(--clr-error)",
        },
        [`&.${isHovered}, &.${isOpen}`]: {
            filter: "brightness(120%)",
        },
        [`&.${pageStyles.isDisabled}`]: {
            filter: "grayscale(1)",
            opacity: 0.5,
        },
    },
});

export const selectValue = style({
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    transition: "opacity var(--anim-duration)",

    selectors: {
        [`${selectContent}.${isEmpty} &`]: {
            color: "rgba(from var(--clr-text) r g b / 40%)",
        },
        [`${selectContent}.${isFiltering} &`]: {
            opacity: 0,
        },
    },
});

export const selectChevron = style({
    flexShrink: 0,
    width: 0,
    height: 0,
    borderLeft: `${FIELD_CHEVRON_WIDTH / 2}px solid transparent`,
    borderRight: `${FIELD_CHEVRON_WIDTH / 2}px solid transparent`,
    borderTop: "6px solid currentColor",
    transition: "transform var(--anim-duration)",

    selectors: {
        [`${selectContent}.${isOpen} &`]: {
            transform: "rotate(180deg)",
        },
    },
});
