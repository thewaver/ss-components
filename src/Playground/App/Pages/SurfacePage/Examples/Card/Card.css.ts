import { style } from "@vanilla-extract/css";

export const borderRadius = 20;

export const root = style({
    width: 400,
    borderRadius,
    boxShadow: "var(--shd-tiny)",
});

export const surfaceRoot = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
});

export const content = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
    whiteSpace: "pre-wrap",
    padding: 20,
});

export const pic = style({
    position: "relative",
});

export const picContent = style([
    content,
    {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,

        backgroundImage: "linear-gradient(to bottom, transparent, var(--clr-primary-contrast) 80%)",
        paddingBottom: 10,
    },
]);

export const surfaceCntent = style([
    content,
    {
        paddingTop: 10,
    },
]);

export const name = style({
    fontSize: "2rem",
    fontWeight: 700,
});

export const role = style({
    fontSize: "1.25rem",
    fontWeight: 500,
});

export const bio = style({
    fontSize: "1rem",
    fontWeight: 400,
    color: "var(--clr-text-secondary)",
});
