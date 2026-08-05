import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

export const isVisible = style({});

export const tooltipContent = style([
    pageStyles.contentSurface,
    {
        maxWidth: 240,
        padding: 10,
        opacity: 0,

        selectors: {
            [`&.${isVisible}`]: {
                opacity: 1,
            },
        },
    },
]);
