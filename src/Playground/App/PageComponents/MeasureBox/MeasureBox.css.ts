import { style } from "@vanilla-extract/css";

const checkerColorA = "rgb(255, 255, 255, 0.1)";
const checkerColorB = "rgb(0, 0, 0, 0.1)";
const checkerSize = 40;

export const MEASURE_BOX_PADDING = checkerSize * 0.5;

export const measureBoxRoot = style({
    position: "relative",
    width: "fit-content",
    isolation: "isolate",
    backgroundImage: [
        `linear-gradient(45deg, ${checkerColorA} 25%, transparent 25%)`,
        `linear-gradient(-45deg, ${checkerColorA} 25%, transparent 25%)`,
        `linear-gradient(45deg, transparent 75%, ${checkerColorA} 75%)`,
        `linear-gradient(-45deg, transparent 75%, ${checkerColorA} 75%)`,
    ].join(","),
    backgroundColor: checkerColorB,
    backgroundSize: `${checkerSize}px ${checkerSize}px`,
    backgroundPosition: `0 0, 0 ${checkerSize * 0.5}px, ${checkerSize * 0.5}px -${checkerSize * 0.5}px, -${checkerSize * 0.5}px 0`,

    selectors: {
        "&::after": {
            content: "",
            position: "absolute",
            inset: 1,
            zIndex: -1,
            border: `2px dashed rgba(255, 255, 255, 0.5)`,
            borderRadius: "inherit",
            pointerEvents: "none",
        },
    },
});
