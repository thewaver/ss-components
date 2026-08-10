import { style } from "@vanilla-extract/css";

const WEEK_COLUMNS = 7;

export const calendarRoot = style({
    display: "grid",
    gridTemplateColumns: `repeat(${WEEK_COLUMNS}, 1fr)`,
    width: "fit-content",
});

export const calendarRow = style({
    display: "grid",
    gridColumn: `span ${WEEK_COLUMNS}`,
    gridTemplateColumns: "subgrid",
});

export const calendarWeekday = style({
    display: "flex",
});

export const calendarDay = style({
    display: "flex",
    pointerEvents: "all",
    width: "100%",

    selectors: {
        "&:focus-visible": {
            zIndex: 1,
        },
    },
});
