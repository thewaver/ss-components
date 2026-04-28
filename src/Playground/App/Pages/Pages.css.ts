import { style } from "@vanilla-extract/css";

export const isVisible = style({});
export const isSelected = style({});

export const container = style({
    backdropFilter: "brightness(75%) grayscale(25%) blur(10px)",
    boxShadow: "var(--shd-tiny), var(--shd-soft)",
    borderRadius: 5,
});

export const content = style({
    backgroundImage: "linear-gradient(45deg, var(--clr-primary), var(--clr-secondary))",
    color: "var(--clr-text-contrast)",
    boxShadow: "var(--shd-tiny)",
    borderRadius: 5,
});

export const buttonContent = style([
    content,
    {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        paddingInline: 20,
        fontWeight: "bold",
    },
]);

export const tooltipContent = style([
    content,
    {
        width: 240,
        padding: 10,
        opacity: 0,

        selectors: {
            [`&.${isVisible}`]: {
                opacity: 1,
            },
        },
    },
]);

const checkerColorA = "rgb(255, 255, 255, 0.1)";
const checkerColorB = "rgb(0, 0, 0, 0.1)";
const checkerSize = 40;

export const measureBox = style({
    position: "relative",
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
            zIndex: 1,
            border: "2px dashed var(--clr-text)",
        },
    },
});
