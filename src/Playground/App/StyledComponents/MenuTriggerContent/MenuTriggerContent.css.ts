import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

const TRIGGER_CHEVRON_WIDTH = 10;

export const isHovered = style({});
export const isOpen = style({});

export const menuTriggerContent = style([
    pageStyles.contentSurface,
    {
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxSizing: "border-box",
        height: 40,
        paddingInline: 20,
        fontWeight: "bold",
        whiteSpace: "nowrap",
        transition: "filter var(--anim-duration), opacity var(--anim-duration)",

        selectors: {
            [`&.${isHovered}, &.${isOpen}`]: {
                filter: "brightness(120%)",
            },
            [`&.${pageStyles.isDisabled}`]: {
                filter: "grayscale(1)",
                opacity: 0.5,
            },
        },
    },
]);

export const menuTriggerChevron = style({
    flexShrink: 0,
    width: 0,
    height: 0,
    borderLeft: `${TRIGGER_CHEVRON_WIDTH / 2}px solid transparent`,
    borderRight: `${TRIGGER_CHEVRON_WIDTH / 2}px solid transparent`,
    borderTop: "6px solid currentColor",
    transition: "transform var(--anim-duration)",

    selectors: {
        [`${menuTriggerContent}.${isOpen} &`]: {
            transform: "rotate(180deg)",
        },
    },
});
