import { style } from "@vanilla-extract/css";

export const isVisible = style({});
export const isSelected = style({});

export const appContent = style({
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    width: "100%",
    height: "100%",
    backgroundImage: "linear-gradient(215deg, var(--clr-bkg-primary), var(--clr-bkg-secondary))",
});

export const leftMenu = style({
    backdropFilter: "brightness(75%) grayscale(25%) blur(10px)",
    boxShadow: "var(--shd-tiny), var(--shd-soft)",
    width: 240,
    padding: 10,
});

export const searchContainer = style({
    width: "100%",
    padding: 10,
});

export const searchInput = style({
    width: "100%",
});

export const tabCategory = style({
    padding: 10,
    fontSize: "0.75rem",
    fontWeight: "bold",
    textAlign: "start",
    textTransform: "uppercase",

    selectors: {
        ":disabled &": {
            cursor: "default",
        },
    },
});

export const tabItem = style({
    paddingBlock: 10,
    paddingInline: 20,
    textAlign: "start",
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
    backgroundImage:
        "linear-gradient(to right, var(--clr-primary) 5px, rgb(from var(--clr-primary) r g b / 25%) 5px, transparent)",
    width: "100%",
    height: "100%",
});

export const tabPage = style({
    display: "flex",
    flexDirection: "column",
    height: "100%",
    gap: 40,
    padding: 40,
    overflowY: "auto",
});

export const tabPageTitle = style({
    fontSize: "1.5rem",
});
