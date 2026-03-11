import { DEFAULT_TOOLTIP_TRANSITION_DURATION_MS } from "src/Lib/Fundamentals/Tooltip/Tooltip";

import { style } from "@vanilla-extract/css";

export const isVisible = style({});

const content = style({
    backgroundColor: "#302010",
    color: "#F0E0D0",
    borderRadius: "4px",
    boxShadow: "0 4px 8px 1px black",
});

export const appContent = style({
    width: "100%",
    height: "100%",
    backgroundColor: "#101820",
});

export const buttonContent = style([
    content,
    {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "60px",
        paddingInline: "20px",
    },
]);

export const tooltipContent = style([
    content,
    {
        width: "240px",
        padding: "20px",
        opacity: 0,
        transition: `opacity ${DEFAULT_TOOLTIP_TRANSITION_DURATION_MS}ms`,

        selectors: {
            [`&.${isVisible}`]: {
                opacity: 1,
            },
        },
    },
]);
