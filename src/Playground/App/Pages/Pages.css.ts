import { globalStyle, style } from "@vanilla-extract/css";

export const isVisible = style({});
export const isSelected = style({});

export const examplesContainer = style({
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: 40,
});

export const exampleContainer = style({
    backdropFilter: "brightness(75%) grayscale(25%) blur(10px)",
    boxShadow: "var(--shd-tiny), var(--shd-soft)",
    borderRadius: 5,
    padding: 20,
});

export const globalPropsContainer = style([
    exampleContainer,
    {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: 10,
        width: "100%",
    },
]);

export const localPropsContainer = style({
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: "100%",
});

export const propContainer = style({
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: 20,
    borderRadius: 5,
    padding: 10,
    width: "100%",
    backgroundColor: "rgb(from var(--clr-bkg-secondary) r g b / 50%)",
    boxShadow: "var(--shd-tiny)",
});

export const stressContainer = style({
    position: "relative",
    display: "grid",
    fontSize: "0.75rem",
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
        maxWidth: 240,
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
    padding: checkerSize * 0.5,

    selectors: {
        "&::after": {
            content: "",
            position: "absolute",
            inset: 1,
            zIndex: 1,
            border: "2px dashed var(--clr-text)",
            borderRadius: "inherit",
            pointerEvents: "none",
        },
    },
});

export const codeBoxOutter = style({
    position: "relative",
    backgroundColor: "var(--clr-bkg-secondary)",
    boxShadow: "var(--shd-tiny)",
    borderRadius: 5,
    padding: 5,
    maxWidth: "100%",

    selectors: {
        "&::after": {
            content: '""',
            position: "absolute",
            inset: 1,
            zIndex: 1,
            border: "2px solid rgb(from var(--clr-text) r g b / 25%)",
            borderRadius: "inherit",
            pointerEvents: "none",
        },
    },
});

export const codeBoxInner = style({
    padding: 15,
    maxHeight: 800,
    fontFamily: "monospace",
    whiteSpace: "pre",
    overflowX: "auto",
    overflowY: "auto",
});

export const tabItem = style({
    marginBottom: 10,
    fontSize: "0.75rem",
    fontWeight: "bold",
    textTransform: "uppercase",
    transition: "color 200ms",

    selectors: {
        "&:hover": {
            color: "var(--clr-primary)",
        },
        [`&.${isSelected}`]: {
            color: "var(--clr-primary)",
        },
    },
});

export const tabFloater = style({
    borderBottom: "2px solid var(--clr-primary)",
});

export const tabsGutter = style({
    borderBottom: "2px solid rgb(from var(--clr-text) r g b / 25%)",
});

const modal = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    backgroundImage: "linear-gradient(215deg, var(--clr-bkg-primary), var(--clr-bkg-secondary))",
});

export const modalOn = style([
    modal,
    {
        transform: "scale(1)",
    },
]);

export const modalOff = style([
    modal,
    {
        transform: "scale(0)",
    },
]);

export const modalHint = style({
    pointerEvents: "none",
    userSelect: "none",
    textTransform: "uppercase",
});

export const overlayOn = style({
    backdropFilter: "blur(10px) grayscale(75%)",
});

export const overlayOff = style({
    backdropFilter: "none",
});

globalStyle(`${propContainer} > :first-child`, { alignSelf: "center" });
