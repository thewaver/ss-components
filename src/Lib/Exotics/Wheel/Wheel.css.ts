import { style } from "@vanilla-extract/css";

const wheelWedge = style({
    position: "absolute",
    inset: 0,
    transformOrigin: "center center",
});

export const flatWheelRoot = style({
    position: "relative",
    width: "100%",
    aspectRatio: "1 / 1",
});

export const flatWheelWedge = style([wheelWedge]);

export const drumWheelRoot = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
});

export const drumWheelGirth = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 0,
    flexShrink: 0,
});

export const drumWheelPerspective = style({
    position: "relative",
});

export const drumWheelBarrel = style({
    position: "absolute",
    inset: 0,
    transformOrigin: "center center",
    transformStyle: "preserve-3d",
});

export const drumWheelWedge = style([
    wheelWedge,
    {
        backfaceVisibility: "hidden",
    },
]);
