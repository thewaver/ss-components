import { createTheme, createThemeContract, globalStyle } from "@vanilla-extract/css";

const SHADOW_SMALL = "0 2px 4px 1px rgba(0, 0, 0, 0.66)";
const SHADOW_MEDIUM = "0 4px 16px 2px rgba(0, 0, 0, 0.5)";
const SHADOW_LARGE = "0 8px 64px 4px rgba(0, 0, 0, 0.33)";

const DEFAULT_THEME_VALUES = {
    scheme: "dark",
    color: {
        primary: {
            dark: "hsl(180, 100%, 37.5%)",
            main: "hsl(180, 100%, 50%)",
            light: "hsl(180, 100%, 62.5%)",
            contrast: "hsl(180, 25%, 12.5%)",
        },
        secondary: {
            dark: "hsl(315, 100%, 37.5%)",
            main: "hsl(315, 100%, 50%)",
            light: "hsl(315, 100%, 62.5%)",
            contrast: "hsl(315, 25%, 12.5%)",
        },
        info: {
            dark: "hsl(210, 50%, 37.5%)",
            main: "hsl(210, 50%, 50%)",
            light: "hsl(210, 50%, 62.5%)",
            contrast: "hsl(210, 25%, 12.5%)",
        },
        success: {
            dark: "hsl(90, 50%, 37.5%)",
            main: "hsl(90, 50%, 50%)",
            light: "hsl(90, 50%, 62.5%)",
            contrast: "hsl(90, 25%, 12.5%)",
        },
        alert: {
            dark: "hsl(45, 50%, 37.5%)",
            main: "hsl(45, 50%, 50%)",
            light: "hsl(45, 50%, 62.5%)",
            contrast: "hsl(45, 25%, 12.5%)",
        },
        error: {
            dark: "hsl(0, 50%, 37.5%)",
            main: "hsl(0, 50%, 50%)",
            light: "hsl(0, 50%, 62.5%)",
            contrast: "hsl(0, 25%, 12.5%)",
        },
        background: {
            dark: "rgb(24, 28, 32)",
            light: "rgb(48, 56, 64)",
            contrast: "rgba(216, 228, 240, 1)",
        },
        surface: {
            dark: "rgba(32, 28, 24, 0.5)",
            light: "rgba(64, 56, 48, 0.5)",
            contrast: "rgba(240, 228, 216, 1)",
        },
        tooltip: {
            dark: "rgba(32, 32, 32, 0.5)",
            light: "rgba(64, 64, 64, 0.5)",
            contrast: "rgba(240, 240, 240, 1)",
        },
        outline: {
            main: "rgb(255, 0, 255)",
        },
    },
    spacing: {
        half: "5px",
        full: "10px",
        double: "20px",
        quad: "40px",
    },
    fontSize: {
        tiny: "0.75rem",
        small: "0.875rem",
        medium: "1rem",
        large: "1.5rem",
    },
    borderRadius: {
        half: "5px",
        full: "10px",
    },
    shadow: {
        small: SHADOW_SMALL,
        medium: `${SHADOW_SMALL}, ${SHADOW_MEDIUM}`,
        large: `${SHADOW_SMALL}, ${SHADOW_MEDIUM}, ${SHADOW_LARGE}`,
    },
    hover: {
        filter: "brightness(120%)",
    },
    active: {
        filter: "brightness(80%)",
    },
    disabled: {
        opacity: "0.5",
        filter: "saturate(0.5)",
    },
    animation: {
        duration: "100ms",
    },
} as const;

export const themeVars = createThemeContract(DEFAULT_THEME_VALUES);

export const defaultTheme = createTheme(themeVars, DEFAULT_THEME_VALUES);

globalStyle("*", {
    boxSizing: "border-box",
    scrollbarWidth: "thin",
    scrollbarColor: `${themeVars.color.primary.main} rgb(from ${themeVars.color.background.dark} r g b / 25%)`,
});

globalStyle(":focus", {
    outline: "0 none",
});

globalStyle(":focus-visible", {
    outline: `2px solid ${themeVars.color.outline.main}`,
});

globalStyle(":disabled, [aria-disabled='true']", {
    cursor: "not-allowed",
});

globalStyle("::-webkit-scrollbar", {
    width: 8,
    height: 8,
});

globalStyle("::-webkit-scrollbar-corner", {
    backgroundColor: themeVars.color.primary.main,
});

globalStyle("::-webkit-scrollbar-track", {
    backgroundColor: `rgb(from ${themeVars.color.background.dark} r g b / 25%)`,
});

globalStyle("::-webkit-scrollbar-thumb", {
    backgroundColor: themeVars.color.primary.main,
});

globalStyle("::-webkit-scrollbar-track:hover, ::-webkit-scrollbar-thumb:hover", {
    filter: themeVars.hover.filter,
});

globalStyle("a, a:visited", {
    color: themeVars.color.primary.main,
    textDecoration: "none",
    outlineOffset: 2,
});

globalStyle("a:hover:not([aria-disabled='true'])", {
    filter: themeVars.hover.filter,
});

globalStyle("a:active:not([aria-disabled='true'])", {
    filter: themeVars.active.filter,
});

globalStyle("body", {
    margin: 0,
    padding: 0,
    color: themeVars.color.background.contrast,
    backgroundColor: "#202020",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 16,
    lineHeight: 1.5,
    colorScheme: themeVars.scheme,
});

globalStyle(".shiki", {
    margin: 0,
    padding: 0,
});
