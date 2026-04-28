import { style } from "@vanilla-extract/css";

export const root = style({});

export const anchorWrapper = style({
    width: "fit-content",
});

export const overlayOn = style({
    backdropFilter: "blur(5px) grayscale(75%)",
});

export const overlayOff = style({
    backdropFilter: "none",
});
