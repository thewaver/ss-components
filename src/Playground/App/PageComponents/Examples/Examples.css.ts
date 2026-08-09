import { style } from "@vanilla-extract/css";

import { themeVars } from "../../Theme.css";

export const examplesRoot = style({
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "start",
    alignItems: "stretch",
    gap: themeVars.spacing.double,
});

export const exampleContainer = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "stretch",
    gap: themeVars.spacing.double,

    color: themeVars.color.surface.contrast,
    backgroundImage: `linear-gradient(45deg, ${themeVars.color.surface.dark}, ${themeVars.color.surface.light})`,
    backdropFilter: "blur(10px)",
    boxShadow: themeVars.shadow.medium,
    borderRadius: themeVars.borderRadius.full,
    padding: themeVars.spacing.double,
});

const sourceModal = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: themeVars.spacing.double,
});

export const sourceModalOn = style([sourceModal, { transform: "scale(1)" }]);

export const sourceModalOff = style([sourceModal, { transform: "scale(0)" }]);

export const exampleTitle = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "start",
    gap: themeVars.spacing.double,
    width: "100%",
});
