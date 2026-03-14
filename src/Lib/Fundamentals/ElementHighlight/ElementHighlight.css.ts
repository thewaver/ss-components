import { style } from "@vanilla-extract/css";

export const elementHighlightOverlay = style({
    position: "absolute",
    inset: 0,
    zIndex: 10,
    pointerEvents: "none",
});

export const elementHighlightOverlaySegment = style({
    position: "absolute",
    display: "grid",
    pointerEvents: "all",
});

export const elementHighlightDecoration = style({
    position: "absolute",
    zIndex: 10,
    pointerEvents: "none",
});
