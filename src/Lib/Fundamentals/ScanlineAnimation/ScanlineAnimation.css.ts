import { style } from "@vanilla-extract/css";

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

export const scanlineAnimationLine = style({
    transformOrigin: "center center",
});
