import { createVar, style } from "@vanilla-extract/css";

export const scanlineAnimationRoot = style({
    position: "relative",
    width: "100%",
    height: "100%",
});

// leave accessible to ARIA, disable segmented SVG instead
export const scanlineAnimationAnchor = style({
    position: "absolute",
    opacity: 0,
});

export const lineSrcVar = createVar();
export const lineSizeVar = createVar();

export const scanlineAnimationLine = style({
    position: "absolute",
    left: 0,
    backgroundImage: lineSrcVar,
    backgroundSize: lineSizeVar,
    backgroundRepeat: "no-repeat",
    transformOrigin: "center center",
});
