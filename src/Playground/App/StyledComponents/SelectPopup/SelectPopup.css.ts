import { style } from "@vanilla-extract/css";

export const isVisible = style({});
export const isFlipped = style({});

export const selectPopupEmpty = style({
    padding: "8px 10px",
    color: "rgba(from var(--clr-text) r g b / 40%)",
    fontSize: "1rem",
    lineHeight: 1.25,
    whiteSpace: "nowrap",
});

export const selectPopup = style({
    boxSizing: "border-box",
    width: "100%",
    maxHeight: 220,
    overflowY: "auto",
    padding: 4,
    boxShadow: "var(--shd-tiny), var(--shd-soft)",
    border: "2px solid rgba(from var(--clr-text) r g b / 25%)",
    borderRadius: 5,
    backgroundColor: "black",
    opacity: 0,
    transform: "translateY(-4px)",

    selectors: {
        [`&.${isFlipped}`]: {
            transform: "translateY(4px)",
        },
        [`&.${isVisible}`]: {
            opacity: 1,
            transform: "translateY(0)",
        },
    },
});
