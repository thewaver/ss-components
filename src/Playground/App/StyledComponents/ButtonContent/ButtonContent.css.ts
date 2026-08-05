import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

export const buttonContent = style([
    pageStyles.contentSurface,
    {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        paddingInline: 20,
        fontWeight: "bold",
        transition: "filter var(--anim-duration), opacity var(--anim-duration), box-shadow var(--anim-duration)",

        selectors: {
            [`&.${pageStyles.hasError}`]: {
                boxShadow: "var(--shd-tiny), 0 0 0 2px var(--clr-error)",
            },
            [`&.${pageStyles.isDisabled}`]: {
                filter: "grayscale(1)",
                opacity: 0.5,
            },
        },
    },
]);
