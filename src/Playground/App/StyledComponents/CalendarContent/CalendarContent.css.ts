import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";
import { FIELD_HEIGHT } from "../TextFieldContent/TextFieldContent.css";

const CELL_SIZE = 46;

export const isSelected = style({});
export const isToday = style({});
export const isOutsideMonth = style({});
export const isHovered = style({});
export const isDisabled = style({});
export const isInRange = style({});
export const isRangeStart = style({});
export const isRangeEnd = style({});

export const calendarDay = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: themeVars.borderRadius.half,
    color: themeVars.color.surface.contrast,
    fontSize: themeVars.fontSize.small,
    fontVariantNumeric: "tabular-nums",
    transition: `background-color ${themeVars.animation.duration}, color ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isOutsideMonth}`]: {
            opacity: 0.35,
        },
        [`&.${isHovered}`]: {
            backgroundColor: `rgb(from ${themeVars.color.primary.main} r g b / 25%)`,
        },
        [`&.${isToday}`]: {
            boxShadow: `inset 0 0 0 1px ${themeVars.color.primary.main}`,
        },
        [`&.${isInRange}`]: {
            borderRadius: 0,
            backgroundColor: `rgb(from ${themeVars.color.primary.main} r g b / 18%)`,
        },
        [`&.${isRangeStart}`]: {
            borderStartStartRadius: themeVars.borderRadius.half,
            borderEndStartRadius: themeVars.borderRadius.half,
        },
        [`&.${isRangeEnd}`]: {
            borderStartEndRadius: themeVars.borderRadius.half,
            borderEndEndRadius: themeVars.borderRadius.half,
        },
        [`&.${isSelected}`]: {
            backgroundImage: `linear-gradient(215deg, ${themeVars.color.primary.light}, ${themeVars.color.primary.dark})`,
            color: themeVars.color.primary.contrast,
        },
        [`&.${isDisabled}`]: {
            opacity: 0.2,
        },
    },
});

export const calendarWeekday = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: CELL_SIZE,
    height: CELL_SIZE,
    color: themeVars.color.surface.contrast,
    fontSize: themeVars.fontSize.xSmall,
    textTransform: "uppercase",
    opacity: 0.6,
});

export const calendarTitle = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: FIELD_HEIGHT,
    paddingInline: themeVars.spacing.full,
    borderRadius: themeVars.borderRadius.half,
    color: themeVars.color.surface.contrast,
    fontSize: themeVars.fontSize.small,
    fontWeight: "bold",
    whiteSpace: "nowrap",
    transition: `color ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}`]: {
            color: themeVars.color.primary.main,
        },
    },
});

export const calendarHeader = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: themeVars.spacing.half,
    width: "100%",
    paddingBottom: themeVars.spacing.half,
    color: themeVars.color.surface.contrast,
    fontSize: themeVars.fontSize.small,
});

export const calendarFrame = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "fit-content",
    borderRadius: themeVars.borderRadius.full,
    padding: themeVars.spacing.full,
    backgroundImage: `linear-gradient(215deg, ${themeVars.color.surface.light}, ${themeVars.color.surface.dark})`,
    boxShadow: themeVars.shadow.medium,
});
