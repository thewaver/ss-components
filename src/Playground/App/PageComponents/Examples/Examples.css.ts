import { style } from "@vanilla-extract/css";

export const examplesRoot = style({
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "start",
    alignItems: "stretch",
    gap: 40,
});

export const exampleContainer = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "stretch",
    gap: 20,
    backdropFilter: "brightness(75%) grayscale(25%) blur(10px)",
    boxShadow: "var(--shd-tiny), var(--shd-soft)",
    borderRadius: 5,
    padding: 20,
});

export const exampleTitle = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "start",
    gap: 20,
    width: "100%",
});
