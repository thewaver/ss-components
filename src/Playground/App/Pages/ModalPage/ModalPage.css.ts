import { style } from "@vanilla-extract/css";

export const root = style({
    display: "flex",
    flexDirection: "column",
    gap: 20,
});

const modal = style({
    backgroundImage: "linear-gradient(215deg, var(--clr-bkg-primary), var(--clr-bkg-secondary))",
    width: 600,
    height: "100%",
    margin: 40,
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

export const overlayOn = style({
    backdropFilter: "blur(5px) grayscale(75%)",
});

export const overlayOff = style({
    backdropFilter: "none",
});

export const buttons = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "start",
    gap: 20,
    marginTop: 20,
});
