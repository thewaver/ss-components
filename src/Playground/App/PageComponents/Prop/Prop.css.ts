import { style, styleVariants } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const propScopeBase = style({
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: themeVars.spacing.full,
    borderRadius: themeVars.borderRadius.half,
    padding: themeVars.spacing.full,
    width: "100%",
    boxShadow: themeVars.shadow.small,
});

export const propsScopeVariants = styleVariants({
    global: [
        propScopeBase,
        {
            color: themeVars.color.background.contrast,
            backgroundColor: themeVars.color.background.dark,
        },
    ],
    local: [
        propScopeBase,
        {
            color: themeVars.color.surface.contrast,
            backgroundColor: themeVars.color.surface.dark,
        },
    ],
    unknown: {},
});

export const propLabel = style({
    alignSelf: "center",
});
