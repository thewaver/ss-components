import { style, styleVariants } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

export const RANGE_THUMB_SIZE = 18;
export const RANGE_TRACK_THICKNESS = 6;
export const RANGE_LENGTH = 220;

export const isFocused = style({});

export const rangeContent = style({
    position: "relative",
    transition: "filter var(--anim-duration), opacity var(--anim-duration)",

    selectors: {
        [`&.${pageStyles.isDisabled}`]: {
            filter: "grayscale(1)",
            opacity: 0.5,
        },
    },
});

export const rangeContentVariants = styleVariants({
    horizontal: {
        height: RANGE_THUMB_SIZE,
    },
    vertical: {
        width: RANGE_THUMB_SIZE,
    },
});

export const rangeTrack = style({
    position: "absolute",
    borderRadius: RANGE_TRACK_THICKNESS,
    backgroundColor: "rgba(from var(--clr-text) r g b / 20%)",
    boxShadow: "var(--shd-tiny)",
});

export const rangeTrackVariants = styleVariants({
    horizontal: {
        left: 0,
        right: 0,
        top: "50%",
        height: RANGE_TRACK_THICKNESS,
        transform: `translateY(-50%)`,
    },
    vertical: {
        top: 0,
        bottom: 0,
        left: "50%",
        width: RANGE_TRACK_THICKNESS,
        transform: `translateX(-50%)`,
    },
});

export const rangeFill = style({
    position: "absolute",
    borderRadius: RANGE_TRACK_THICKNESS,
    backgroundColor: "var(--clr-primary)",

    selectors: {
        [`&.${pageStyles.hasError}`]: {
            backgroundColor: "var(--clr-error)",
        },
    },
});

export const rangeFillVariants = styleVariants({
    horizontal: {
        top: 0,
        bottom: 0,
    },
    vertical: {
        left: 0,
        right: 0,
    },
});

export const rangeThumb = style({
    position: "absolute",
    width: RANGE_THUMB_SIZE,
    height: RANGE_THUMB_SIZE,
    borderRadius: "50%",
    border: "2px solid var(--clr-primary)",
    backgroundColor: "black",
    boxShadow: "var(--shd-tiny)",
    transition: "border-color var(--anim-duration), transform var(--anim-duration)",

    selectors: {
        [`&.${isFocused}`]: {
            transform: "scale(1.2)",
        },
        [`&.${pageStyles.hasError}`]: {
            borderColor: "var(--clr-error)",
        },
    },
});

export const rangeThumbVariants = styleVariants({
    horizontal: {
        top: "50%",
        marginTop: -RANGE_THUMB_SIZE / 2,
    },
    vertical: {
        left: "50%",
        marginLeft: -RANGE_THUMB_SIZE / 2,
    },
});
