import { style } from "@vanilla-extract/css";

export const root = style({});

export const textContent = style({
    position: "relative",
    padding: 20,
    whiteSpace: "pre-wrap",

    selectors: {
        "&::after": {
            content: "",
            position: "absolute",
            inset: 1,
            zIndex: 1,
            border: "2px dashed var(--clr-text)",
        },
    },
});

export const flexRow = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    gap: 20,
});
