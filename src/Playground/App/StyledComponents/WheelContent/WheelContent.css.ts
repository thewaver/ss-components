import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const SPIN_SIZE = 84;
const PIP_SIZE = 20;
const PIP_OVERHANG_PERCENT = 50;
const PIP_SHADOW = "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.75))";

export const isHovered = style({});
export const isActive = style({});
export const isDisabled = style({});
export const isSelected = style({});

export const wheelWedge = style({
    position: "relative",
    containerType: "inline-size",
    width: "100%",
    height: "100%",
});

export const wheelWedgeSVG = style({
    position: "absolute",
    inset: 0,
    overflow: "visible",
});

export const wheelWedgeShape = style({
    fill: themeVars.color.control.background.main,
    stroke: themeVars.color.primary.main,
    strokeWidth: 0.5,
    strokeLinejoin: "round",
});

export const wheelWedgeGradientFrom = style({
    stopColor: themeVars.color.secondary.dark,
});

export const wheelWedgeGradientTo = style({
    stopColor: themeVars.color.secondary.light,
});

export const wheelWedgeLabel = style({
    position: "absolute",
    bottom: "50cqw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5em",
    color: themeVars.color.control.background.contrast,
    lineHeight: 1.2,
    textAlign: "center",
    textWrap: "balance",

    selectors: {
        [`${isSelected} &`]: {
            color: themeVars.color.secondary.contrast,
        },
    },
});

export const wheelStack = style({
    position: "relative",
});

export const wheelMount = style({
    position: "relative",
    width: "fit-content",
    marginInline: "auto",
});

const pip = style({
    position: "absolute",
    width: PIP_SIZE,
    height: PIP_SIZE,
    filter: PIP_SHADOW,
    pointerEvents: "none",
});

export const wheelPipTop = style([
    pip,
    {
        top: 0,
        left: "50%",
        transform: `translate(-50%, -${PIP_OVERHANG_PERCENT}%)`,
    },
]);

export const wheelPipLeft = style([
    pip,
    {
        top: "50%",
        left: 0,
        transform: `translate(-${PIP_OVERHANG_PERCENT}%, -50%) rotate(-90deg)`,
    },
]);

export const wheelPipShape = style({
    display: "block",
    width: "100%",
    height: "100%",
    fill: themeVars.color.control.background.main,
    stroke: themeVars.color.secondary.main,
    strokeWidth: 2,
    strokeLinejoin: "round",
});

export const wheelCentre = style({
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
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
        fontWeight: "bold",
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
    backgroundImage: `linear-gradient(160deg, ${themeVars.color.control.background.main}, ${themeVars.color.control.background.main})`,
    border: `2px solid ${themeVars.color.primary.main}`,
    color: themeVars.color.control.background.contrast,
    fontSize: themeVars.fontSize.small,
    textAlign: "center",

    selectors: {
        [`&.${isSelected}`]: {
            backgroundImage: `linear-gradient(215deg, ${themeVars.color.secondary.light}, ${themeVars.color.secondary.dark})`,
            borderColor: themeVars.color.primary.light,
            color: themeVars.color.secondary.contrast,
        },
    },
});

export const wheelCardBack = style({
    backgroundImage: `repeating-linear-gradient(45deg, ${themeVars.color.primary.main} 0 6px, ${themeVars.color.control.background.main} 6px 12px)`,
});

export const wheelCardRank = style({
    fontSize: themeVars.fontSize.large,
    color: themeVars.color.primary.main,

    selectors: {
        [`${isSelected} &`]: {
            color: themeVars.color.secondary.contrast,
        },
    },
});
