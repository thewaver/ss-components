import { style } from "@vanilla-extract/css";

export const boldText = style({
    fontWeight: "bold",
});

export const italicText = style({
    fontStyle: "italic",
});

export const strikedText = style({
    textDecorationLine: "line-through",
});

export const underlineText = style({
    textDecorationLine: "underline",
});

export const listItem = style({
    selectors: {
        ["&::before"]: {
            content: "🢖 ",
        },
    },
});
