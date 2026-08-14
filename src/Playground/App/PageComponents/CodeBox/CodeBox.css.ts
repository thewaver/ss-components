import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const codeBoxRoot = style({
    position: "relative",
    backgroundColor: "black",
    boxShadow: themeVars.shadow.small,
    borderRadius: themeVars.borderRadius.half,
    padding: themeVars.spacing.half,
    maxWidth: "100%",

    selectors: {
        "&::after": {
            content: '""',
            position: "absolute",
            inset: 1,
            zIndex: 1,
            border: `2px solid rgba(255, 255, 255, 0.5)`,
            borderRadius: "inherit",
            pointerEvents: "none",
        },
    },
});

export const codeBoxContent = style({
    padding: `calc(${themeVars.spacing.double} - ${themeVars.spacing.half})`,
    fontFamily: "monospace",
    whiteSpace: "pre",
    overflowX: "auto",
    overflowY: "auto",
});
