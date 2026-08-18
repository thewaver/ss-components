import { style } from "@vanilla-extract/css";

export const formationRoot = style({
    position: "relative",
    containerType: "inline-size",
    width: "100%",
});

export const formationSpacer = style({
    width: "100%",
    pointerEvents: "none",
});

export const formationItem = style({
    position: "absolute",
    transform: "translate(-50%, -50%)",
});
