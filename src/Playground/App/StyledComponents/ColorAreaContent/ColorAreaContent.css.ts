import { createVar, style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";
import { FIELD_HEIGHT, FIELD_PADDING } from "../TextFieldContent/TextFieldContent.css";

export const hueVar = createVar();
export const thumbXVar = createVar();
export const thumbYVar = createVar();
export const swatchVar = createVar();

const THUMB_SIZE = 16;

export const isDragging = style({});
export const isHovered = style({});
export const isFocused = style({});
export const isDisabled = style({});

export const colorAreaSquare = style({
    position: "relative",
    borderRadius: themeVars.borderRadius.half,
    backgroundImage: [
        "linear-gradient(to top, #000, transparent)",
        `linear-gradient(to right, #fff, hsl(${hueVar} 100% 50%))`,
    ].join(","),
    boxShadow: `inset 0 0 0 1px rgb(from ${themeVars.color.surface.contrast} r g b / 25%)`,
    cursor: "crosshair",

    selectors: {
        [`&.${isDisabled}`]: {
            filter: "grayscale(1) brightness(60%)",
            cursor: "not-allowed",
        },
    },
});

export const colorAreaThumb = style({
    position: "absolute",
    top: thumbYVar,
    left: thumbXVar,

    width: THUMB_SIZE,
    height: THUMB_SIZE,
    marginTop: -THUMB_SIZE / 2,
    marginLeft: -THUMB_SIZE / 2,
    borderRadius: "50%",
    border: "2px solid white",
    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.5)",
    pointerEvents: "none",

    selectors: {
        [`${colorAreaSquare}.${isDragging} &`]: {
            transform: "scale(1.2)",
        },
        [`${colorAreaSquare}.${isFocused} &`]: {
            outline: `2px solid ${themeVars.color.outline.main}`,
            outlineOffset: 2,
        },
    },
});

const HUE_THUMB_SIZE = 18;
const HUE_TRACK_HEIGHT = 12;

export const hueSlider = style({
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: HUE_THUMB_SIZE,
});

export const hueTrack = style({
    width: "100%",
    height: HUE_TRACK_HEIGHT,
    borderRadius: HUE_TRACK_HEIGHT / 2,
    backgroundImage: `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360]
        .map((hue) => `hsl(${hue} 100% 50%)`)
        .join(",")})`,
    boxShadow: `inset 0 0 0 1px rgb(from ${themeVars.color.surface.contrast} r g b / 25%)`,
});

export const hueThumb = style({
    position: "absolute",
    top: 0,

    width: HUE_THUMB_SIZE,
    height: HUE_THUMB_SIZE,
    borderRadius: "50%",
    border: "2px solid white",
    backgroundColor: swatchVar,
    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.5)",
    pointerEvents: "none",

    selectors: {
        [`&.${isFocused}`]: {
            outline: `2px solid ${themeVars.color.outline.main}`,
            outlineOffset: 2,
        },
    },
});

export const colorSwatch = style({
    width: 24,
    height: 24,
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: swatchVar,
    backgroundClip: "padding-box",
    boxShadow: `inset 0 0 0 1px rgb(from ${themeVars.color.surface.contrast} r g b / 40%)`,
});

export const colorPickerPopup = style({
    display: "flex",
    flexDirection: "column",
    gap: themeVars.spacing.full,
    width: 360,
    borderRadius: themeVars.borderRadius.full,
    padding: themeVars.spacing.double,
    color: themeVars.color.surface.contrast,
    backgroundImage: `linear-gradient(215deg, ${themeVars.color.surface.light}, ${themeVars.color.surface.dark})`,
    backdropFilter: "brightness(75%) blur(10px)",
    boxShadow: themeVars.shadow.large,
});

const CHECKER_SIZE = 8;

const checkerboard = {
    backgroundImage: [
        `linear-gradient(45deg, rgba(255, 255, 255, 0.25) 25%, transparent 25%)`,
        `linear-gradient(-45deg, rgba(255, 255, 255, 0.25) 25%, transparent 25%)`,
        `linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.25) 75%)`,
        `linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.25) 75%)`,
    ].join(","),
    backgroundSize: `${CHECKER_SIZE}px ${CHECKER_SIZE}px`,
    backgroundPosition: `0 0, 0 ${CHECKER_SIZE / 2}px, ${CHECKER_SIZE / 2}px -${CHECKER_SIZE / 2}px, -${CHECKER_SIZE / 2}px 0`,
} as const;

export const colorSwatchChecker = style({
    ...checkerboard,
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: "black",
});

export const colorChannels = style({
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: themeVars.spacing.half,
});

export const colorChannel = style({
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
});

export const colorChannelLabel = style({
    color: themeVars.color.surface.contrast,
    fontSize: themeVars.fontSize.xSmall,
    textTransform: "uppercase",
    opacity: 0.6,
});

export const colorPickerRow = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.full,
    fontSize: themeVars.fontSize.xSmall,
    fontVariantNumeric: "tabular-nums",
});

export const colorFieldTrigger = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.full,
    width: 180,
    height: FIELD_HEIGHT,
    boxShadow: themeVars.shadow.small,
    border: `2px solid rgb(from currentColor r g b / 25%)`,
    borderRadius: themeVars.borderRadius.half,
    paddingInline: FIELD_PADDING,
    backgroundColor: "black",
    color: themeVars.color.surface.contrast,
    fontSize: themeVars.fontSize.medium,
    fontVariantNumeric: "tabular-nums",
    transition: `filter ${themeVars.animation.duration}, border-color ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}`]: {
            filter: themeVars.hover.filter,
        },
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: themeVars.disabled.opacity,
        },
    },
});

export const colorPreviewChecker = style({
    ...checkerboard,
    width: "100%",
    height: 28,
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: "black",
});

export const colorPreview = style({
    width: "100%",
    height: "100%",
    borderRadius: themeVars.borderRadius.half,
    backgroundColor: swatchVar,
    boxShadow: `inset 0 0 0 1px rgb(from ${themeVars.color.surface.contrast} r g b / 40%)`,
});
