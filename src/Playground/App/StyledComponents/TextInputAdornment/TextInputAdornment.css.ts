import { style } from "@vanilla-extract/css";

import * as pageStyles from "../../Pages/Pages.css";

export const isHovered = style({});

export const textInputAdornment = style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 26,
    paddingInline: 10,
    borderRadius: 4,
    color: "rgba(from var(--clr-text) r g b / 60%)",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    transition: "background-color var(--anim-duration), color var(--anim-duration), opacity var(--anim-duration)",

    selectors: {
        [`&.${isHovered}`]: {
            color: "var(--clr-text)",
            backgroundColor: "rgba(from var(--clr-text) r g b / 15%)",
        },
        [`&.${pageStyles.isDisabled}`]: {
            filter: "grayscale(1)",
            opacity: 0.5,
        },
    },
});
