import { style, styleVariants } from "@vanilla-extract/css";

const DRAWER_THICKNESS = 320;
const DRAWER_DEPTH = 200;

export const drawerPanel = style({
    display: "flex",
    flexDirection: "column",
    gap: 20,
    padding: 20,
    backgroundImage: "linear-gradient(215deg, var(--clr-bkg-primary), var(--clr-bkg-secondary))",
    boxShadow: "var(--shd-soft)",
});

export const drawerSizeVariants = styleVariants({
    left: { width: DRAWER_THICKNESS },
    right: { width: DRAWER_THICKNESS },
    top: { height: DRAWER_DEPTH },
    bottom: { height: DRAWER_DEPTH },
});

export const drawerSlideOffVariants = styleVariants({
    left: { transform: "translateX(-100%)" },
    right: { transform: "translateX(100%)" },
    top: { transform: "translateY(-100%)" },
    bottom: { transform: "translateY(100%)" },
});

export const drawerSlideOn = style({
    transform: "translate(0, 0)",
});
