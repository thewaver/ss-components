import { createVar, style } from "@vanilla-extract/css";

export const backgroundColor = createVar();
export const paddingTop = createVar();
export const paddingRight = createVar();
export const paddingBottom = createVar();
export const paddingLeft = createVar();

export const root = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    gap: 40,
});

export const valueList = style({
    display: "grid",
    gap: 10,
});

export const colorList = style({
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "start",
    gap: 10,
});

export const example = style({
    backgroundColor,
    resize: "both",
    overflow: "auto",
    width: 360,
    height: 240,
});

export const exampleWithPadding = style([
    example,
    {
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
    },
]);
