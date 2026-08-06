import { style } from "@vanilla-extract/css";

export const root = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    gap: 40,
});

export const exampleRoot = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "start",
    flexWrap: "wrap",
    gap: 20,
});

export const weightGrid = style({
    display: "grid",
    gap: 1,
});

export const weightCell = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 34,
    padding: 2,
    fontSize: 10,
    backgroundColor: "#FFFFFF10",
});

export const weightOriginCell = style([
    weightCell,
    {
        backgroundColor: "#FFFFFF40",
        outline: "1px solid currentColor",
    },
]);

export const valueList = style({
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
});
