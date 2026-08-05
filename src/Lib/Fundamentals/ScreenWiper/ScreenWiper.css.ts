import { style, styleVariants } from "@vanilla-extract/css";

export const screenWiperRoot = style({
    position: "fixed",
    inset: 0,
    zIndex: 10,
});

export const screenWiperRow = style({
    display: "flex",
    flexDirection: "row",
});

const screenWiperCell = style({
    flexShrink: 0,
    backgroundColor: "black",
});

export const screenWiperCellShapes = styleVariants({
    lozenge: [screenWiperCell, { clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }],
    circle: [screenWiperCell, { borderRadius: "50%" }],
});
