import { style } from "@vanilla-extract/css";

export const clockRoot = style({
    display: "flex",
    width: "fit-content",
});

export const clockColumn = style({
    display: "flex",
    flexDirection: "column",
});

export const clockUnit = style({
    display: "flex",
});

export const clockList = style({
    display: "flex",
    flexDirection: "column",
});

export const clockOption = style({
    display: "flex",
    pointerEvents: "all",
    width: "100%",

    selectors: {
        "&:focus-visible": {
            zIndex: 1,
        },
    },
});
