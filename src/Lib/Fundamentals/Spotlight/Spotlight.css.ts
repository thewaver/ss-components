import { style } from "@vanilla-extract/css";

export const spotlightOverlay = style({
    position: "absolute",
    inset: 0,
    zIndex: 10,
    pointerEvents: "none",
});

export const spotlightOverlaySegment = style({
    position: "absolute",
    display: "grid",
    pointerEvents: "all",
});

export const spotlightDecoration = style({
    position: "absolute",
    zIndex: 10,
    pointerEvents: "none",
});

export const spotlightPopup = style({
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
    pointerEvents: "all",
});
