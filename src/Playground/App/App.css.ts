import { style } from "@vanilla-extract/css";

export const isVisible = style({});
export const isSelected = style({});

const content = style({
    backgroundImage: "linear-gradient(45deg, var(--clr-primary), var(--clr-secondary))",
    color: "var(--clr-text-contrast)",
    borderRadius: 5,
    boxShadow: "var(--shd-tiny)",
});

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
    padding: 40,
});

export const tabPageTitle = style({
    fontSize: "1.5rem",
});

export const buttonContent = style([
    content,
    {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 60,
        paddingInline: 20,
    },
]);

export const tooltipContent = style([
    content,
    {
        width: 240,
        padding: 20,
        opacity: 0,

        selectors: {
            [`&.${isVisible}`]: {
                opacity: 1,
            },
        },
    },
]);

export const textContent = style({
    padding: 20,
    border: "2px solid var(--clr-text)",
    whiteSpace: "pre-wrap",
});

export const imgContent = style({
    height: 160,
    width: 160,
    border: "2px solid var(--clr-text)",
});

export const wrapper = style({
    width: "fit-content",
    margin: 40,
});

export const overlayOn = style({
    backdropFilter: "blur(5px) grayscale(75%)",
});

export const overlayOff = style({
    backdropFilter: "none",
});

export const flexRow = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    gap: 20,
});

export const textHighlight = style({
    textTransform: "uppercase",
    lineHeight: 2,
});
