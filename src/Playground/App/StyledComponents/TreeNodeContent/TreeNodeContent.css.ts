import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const isBranch = style({});
export const isExpanded = style({});
export const isHovered = style({});
export const isSelected = style({});
export const isDisabled = style({});

export const treeNodeContent = style({
    display: "flex",
    alignItems: "center",
    gap: themeVars.spacing.full,
    padding: themeVars.spacing.half,
    borderRadius: themeVars.borderRadius.half,
    fontSize: themeVars.fontSize.medium,
    lineHeight: 1.25,
    whiteSpace: "nowrap",
    transition: `background-color ${themeVars.animation.duration}, opacity ${themeVars.animation.duration}`,

    selectors: {
        [`&.${isHovered}`]: {
            backgroundColor: `rgb(from ${themeVars.color.surface.contrast} r g b / 20%)`,
        },
        [`&.${isSelected}`]: {
            color: themeVars.color.primary.main,
            fontWeight: 700,
        },
        [`&.${isDisabled}`]: {
            filter: themeVars.disabled.filter,
            opacity: 0.4,
        },
    },
});

export const treeNodeMarker = style({
    width: "1ch",
    fontSize: themeVars.fontSize.xSmall,
    opacity: 0.5,
    transition: `transform ${themeVars.animation.duration}`,

    selectors: {
        [`${treeNodeContent}.${isBranch} &`]: {
            opacity: 1,
        },
        [`${treeNodeContent}.${isExpanded} &`]: {
            transform: "rotate(90deg)",
        },
    },
});

export const treeNodeDetail = style({
    fontSize: themeVars.fontSize.small,
    opacity: 0.6,
});
