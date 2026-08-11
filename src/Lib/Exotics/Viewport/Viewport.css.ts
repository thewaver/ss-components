import { style } from "@vanilla-extract/css";

const viewportHost = style({
    overflow: "hidden",
});

export const viewportRootHost = style([
    viewportHost,
    { position: "fixed", top: 0, left: 0, width: "100%", height: "100%" },
]);

export const viewportNestedHost = style([viewportHost, { position: "relative", width: "100%", height: "100%" }]);

export const viewportRoot = style({
    position: "absolute",
    top: 0,
    left: 0,
    transformOrigin: "top left",
});

export const viewportContent = style({
    position: "relative",
    width: "100%",
    height: "100%",
});

export const viewportPortal = style({
    position: "absolute",
    inset: 0,
    zIndex: 10,
    pointerEvents: "none",
});
