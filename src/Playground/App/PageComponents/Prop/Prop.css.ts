import { style } from "@vanilla-extract/css";

export const propRoot = style({
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

export const propLabel = style({
    alignSelf: "center",
});
