import { style } from "@vanilla-extract/css";

export const shapeRoot = style({
    position: "relative",
    pointerEvents: "visiblePainted",
});

const shapeSVG = style({
    position: "absolute",
    inset: 0,
});

export const shapeStrokeSVG = style([
    shapeSVG,
    {
        zIndex: 1,
        pointerEvents: "none",
    },
]);

export const shapeFillSVG = style([
    shapeSVG,
    {
        zIndex: -1,
    },
]);
