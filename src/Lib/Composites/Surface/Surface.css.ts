import { createVar, style } from "@vanilla-extract/css";

export const fillColorVar = createVar();
export const fillOpacityVar = createVar();
export const strokeColorVar = createVar();
export const strokeOpacityVar = createVar();

export const surfaceDivRoot = style({
    position: "relative",
    overflow: "hidden",
    backgroundColor: [fillColorVar, `rgb(from ${fillColorVar} r g b / ${fillOpacityVar})`],
});

export const surfaceDivBorder = style({
    position: "absolute",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",

    borderRadius: "inherit",
    borderStyle: "solid",
    borderColor: [strokeColorVar, `rgb(from ${strokeColorVar} r g b / ${strokeOpacityVar})`],
});
