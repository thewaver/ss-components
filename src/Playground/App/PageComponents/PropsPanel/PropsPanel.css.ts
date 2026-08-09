import { style, styleVariants } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const propsPanelBase = style({
    gap: themeVars.spacing.full,
    width: "100%",
});

export const propsPanelScopeVariants = styleVariants({
    global: [
        propsPanelBase,
        {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
        },
    ],
    local: [
        propsPanelBase,
        {
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
        },
    ],
});
