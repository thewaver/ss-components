import { style, styleVariants } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const propsPanelScopeBase = style({
    gap: themeVars.spacing.full,
    width: "100%",
});

export const propsPanelScopeVariants = styleVariants({
    global: [
        propsPanelScopeBase,
        {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
        },
    ],
    local: [
        propsPanelScopeBase,
        {
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
        },
    ],
});
