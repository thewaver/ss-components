import { keyframes, style, styleVariants } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

const countdown = keyframes({
    "0%": { width: "100%" },
    "100%": { width: "0%" },
});

export const toastCard = style({
    position: "relative",
    overflow: "hidden",

    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.full,
    width: 300,
    borderRadius: themeVars.borderRadius.half,
    borderLeft: "4px solid currentColor",
    padding: themeVars.spacing.full,
    color: themeVars.color.surface.contrast,
    backgroundImage: `linear-gradient(215deg, ${themeVars.color.surface.light}, ${themeVars.color.surface.dark})`,
    backdropFilter: "brightness(75%) grayscale(25%) blur(10px)",
    boxShadow: themeVars.shadow.medium,
});

export const toastKindVariants = styleVariants({
    info: { color: themeVars.color.info.main },
    success: { color: themeVars.color.success.main },
    error: { color: themeVars.color.error.main },
});

export const toastAnimationOffVariants = styleVariants({
    zoom: { transform: "scale(0.75)", opacity: 0 },
    slide: { transform: "translateX(120%)", opacity: 0 },
    fade: { opacity: 0 },
});

export const toastAnimationOn = style({
    transform: "none",
    opacity: 1,
});

export const toastBody = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.half,
    flexGrow: 1,
});

export const toastMessage = style({
    color: themeVars.color.surface.contrast,
    fontSize: themeVars.fontSize.small,
});

export const toastMeta = style({
    color: themeVars.color.surface.contrast,
    fontSize: themeVars.fontSize.xSmall,
    fontVariantNumeric: "tabular-nums",
    opacity: 0.6,
});

export const toastCountdown = style({
    position: "absolute",
    bottom: 0,
    left: 0,

    height: 2,
    backgroundColor: "currentColor",
    animationName: countdown,
    animationTimingFunction: "linear",
    animationFillMode: "forwards",
});
