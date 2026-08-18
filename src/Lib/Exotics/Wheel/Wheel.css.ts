import { style } from "@vanilla-extract/css";

import { buttonElement } from "../../Fundamentals/Button/Button.css";

const wheelWedge = style({
    position: "absolute",
    inset: 0,
    transformOrigin: "center center",
    transitionProperty: "transform",
});

export const wheelControl = style([buttonElement, {}]);

export const flatWheelRoot = style({
    position: "relative",
    width: "100%",
    aspectRatio: "1 / 1",
});

export const flatWheelWedge = style([wheelWedge]);

export const flatWheelHub = style({
    position: "absolute",
    inset: "35%",
    overflow: "visible",
});

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

export const drumWheelControls = style({
    flexGrow: 0,
    flexShrink: 0,
});
