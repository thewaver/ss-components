export type AnchorHPlacement = "left-in" | "left-out" | "right-in" | "right-out" | "center";

export type AnchorVPlacement = "top-in" | "top-out" | "bottom-in" | "bottom-out" | "center";

export type AnchorPlacement = {
    x: AnchorHPlacement;
    y: AnchorVPlacement;
};
