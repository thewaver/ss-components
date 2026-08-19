import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const SPIN_SIZE = 84;

export const isHovered = style({});
export const isActive = style({});
export const isDisabled = style({});
export const isSelected = style({});

export const wheelWedge = style({
    position: "relative",
    width: "100%",
    height: "100%",
});

export const wheelWedgeSVG = style({
    position: "absolute",
    inset: 0,
    overflow: "visible",
});

export const wheelWedgeShape = style({
    fill: `rgb(from ${themeVars.color.background.light} r g b / 90%)`,
    stroke: themeVars.color.primary.dark,
    strokeWidth: 0.5,
    strokeLinejoin: "round",

    selectors: {
        [`&.${isSelected}`]: {
            fill: themeVars.color.primary.dark,
            stroke: themeVars.color.primary.light,
        },
    },
});

export const wheelWedgeLabel = style({
    position: "absolute",
    top: 0,
    right: 0,
    bottom: "50%",
    left: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: themeVars.spacing.half,
    paddingTop: "12%",
    transformOrigin: "top center",
    color: themeVars.color.background.contrast,
    fontSize: themeVars.fontSize.small,
    whiteSpace: "nowrap",
});

export const wheelStack = style({
    position: "relative",
});

export const wheelHub = style({
    position: "absolute",
    inset: "35%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
});

export const wheelBar = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: themeVars.spacing.full,
    padding: themeVars.spacing.double,
});

const controlBase = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    transition: `color ${themeVars.animation.duration}, filter ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}`]: {
            filter: themeVars.hover.filter,
        },
        [`&.${isActive}`]: {
            filter: themeVars.active.filter,
        },
        [`&.${isDisabled}`]: {
            opacity: themeVars.disabled.opacity,
            filter: themeVars.disabled.filter,
        },
    },
});

export const wheelSpin = style([
    controlBase,
    {
        flexGrow: 0,
        flexShrink: 0,
        width: SPIN_SIZE,
        height: SPIN_SIZE,
        backgroundImage: `radial-gradient(${themeVars.color.primary.light}, ${themeVars.color.primary.dark})`,
        border: `2px solid ${themeVars.color.primary.light}`,
        color: themeVars.color.primary.contrast,
        fontSize: themeVars.fontSize.small,
        textTransform: "uppercase",
        boxShadow: themeVars.shadow.medium,
    },
]);

export const wheelCard = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: themeVars.spacing.full,
    padding: `0 ${themeVars.spacing.full}`,
    width: "100%",
    height: "100%",
    borderRadius: themeVars.borderRadius.half,
    backgroundImage: `linear-gradient(160deg, ${themeVars.color.background.light}, ${themeVars.color.background.dark})`,
    border: `2px solid ${themeVars.color.primary.dark}`,
    color: themeVars.color.background.contrast,
    fontSize: themeVars.fontSize.small,
    textAlign: "center",

    selectors: {
        [`&.${isSelected}`]: {
            borderColor: themeVars.color.primary.light,
        },
    },
});

export const wheelCardBack = style({
    backgroundImage: `repeating-linear-gradient(45deg, ${themeVars.color.primary.dark} 0 6px, ${themeVars.color.background.dark} 6px 12px)`,
});

export const wheelCardRank = style({
    fontSize: themeVars.fontSize.large,
    color: themeVars.color.primary.main,
});
