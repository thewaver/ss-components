import { style } from "@vanilla-extract/css";

export const codeBoxRoot = style({
    position: "relative",
    backgroundColor: "var(--clr-bkg-secondary)",
    boxShadow: "var(--shd-tiny)",
    borderRadius: 5,
    padding: 5,
    maxWidth: "100%",

    selectors: {
        "&::after": {
            content: '""',
            position: "absolute",
            inset: 1,
            zIndex: 1,
            border: "2px solid rgb(from var(--clr-text) r g b / 25%)",
            borderRadius: "inherit",
            pointerEvents: "none",
        },
    },
});

export const codeBoxContent = style({
    padding: 15,
    maxHeight: 800,
    fontFamily: "monospace",
    whiteSpace: "pre",
    overflowX: "auto",
    overflowY: "auto",
});
