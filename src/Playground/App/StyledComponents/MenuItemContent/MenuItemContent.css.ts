import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

export const isHovered = style({});
export const isHighlighted = style({});

export const menuItemContent = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    padding: "8px 10px",
    borderRadius: 3,
    color: "var(--clr-text)",
    fontSize: "1rem",
    lineHeight: 1.25,
    whiteSpace: "nowrap",
    transition: "background-color var(--anim-duration), opacity var(--anim-duration)",

    selectors: {
        [`&.${isHighlighted}`]: {
            backgroundColor: "rgba(from var(--clr-text) r g b / 10%)",
        },
        [`&.${isHovered}`]: {
            backgroundColor: "rgba(from var(--clr-text) r g b / 20%)",
        },
        [`&.${pageStyles.isDisabled}`]: {
            filter: "grayscale(1)",
            opacity: 0.4,
        },
    },
});

export const menuItemShortcut = style({
    opacity: 0.4,
    fontSize: "0.75rem",
});
