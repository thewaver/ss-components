import { style } from "@vanilla-extract/css";

export const isVisible = style({});

export const panel = style({
    backdropFilter: "brightness(75%) grayscale(25%) blur(10px)",
    boxShadow: "var(--shd-tiny), var(--shd-soft)",
    borderRadius: 5,
    padding: 20,
});

const content = style({
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
