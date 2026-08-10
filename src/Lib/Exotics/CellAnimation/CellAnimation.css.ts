import { createVar, style } from "@vanilla-extract/css";

export const cellAnimationRoot = style({
    position: "relative",
    width: "100%",
    height: "100%",
});

export const cellAnimationAnchor = style({
    position: "absolute",
    opacity: 0,
});

export const cellSrcVar = createVar();
export const cellSizeVar = createVar();

export const cellAnimationContainer = style({
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
});

export const cellAnimationCell = style({
    position: "absolute",
    backgroundImage: cellSrcVar,
    backgroundSize: cellSizeVar,
    backgroundRepeat: "no-repeat",
    transformOrigin: "center center",
});
