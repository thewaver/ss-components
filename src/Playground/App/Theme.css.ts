import { createTheme, createThemeContract, globalStyle } from "@vanilla-extract/css";

const SHADOW_SMALL = "0 2px 2px 0px rgba(0, 0, 0, 1)";
const SHADOW_MEDIUM = "0 4px 8px 0px rgba(0, 0, 0, 0.75)";
const SHADOW_LARGE = "0 16px 64px 0px rgba(0, 0, 0, 0.5)";

const DEFAULT_THEME_VALUES = {
    scheme: "dark",
    color: {
        primary: {
            dark: "hsl(195, 75%, 50%)",
            main: "hsl(165, 100%, 50%)",
            light: "hsl(165, 75%, 60%)",
            contrast: "rgb(0, 0, 0)",
        },
        secondary: {
            dark: "hsl(30, 75%, 50%)",
            main: "hsl(30, 100%, 50%)",
            light: "hsl(45, 75%, 60%)",
            contrast: "rgb(0, 0, 0)",
        },
        info: {
            dark: "hsl(225, 50%, 40%)",
            main: "hsl(225, 75%, 50%)",
            light: "hsl(225, 50%, 50%)",
            contrast: "rgb(255, 255, 255)",
        },
        success: {
            dark: "hsl(90, 50%, 50%)",
            main: "hsl(90, 75%, 50%)",
            light: "hsl(90, 50%, 60%)",
            contrast: "rgb(0, 0, 0)",
        },
        alert: {
            dark: "hsl(45, 50%, 50%)",
            main: "hsl(45, 75%, 50%)",
            light: "hsl(45, 50%, 60%)",
            contrast: "rgb(0, 0, 0)",
        },
        error: {
            dark: "hsl(0, 50%, 40%)",
            main: "hsl(0, 75%, 50%)",
            light: "hsl(0, 50%, 50%)",
            contrast: "rgb(255, 255, 255)",
        },
        background: {
            dark: "hsl(0, 10%, 10%)",
            light: "hsl(30, 10%, 20%)",
            contrast: "hsl(30, 25%, 90%)",
        },
        surface: {
            dark: "hsl(215, 10%, 10%)",
            light: "hsl(195, 10%, 20%)",
            contrast: "hsl(195, 25%, 90%)",
        },
        tooltip: {
            dark: "rgba(16, 16, 16, 0.75)",
            light: "rgba(32, 32, 32, 0.75)",
            contrast: "rgba(240, 240, 240, 1)",
        },
        control: {
            background: {
                main: "rgb(0, 0, 0)",
                contrast: "rgb(255, 255, 255)",
            },
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
        xSmall: "0.75rem",
        small: "0.875rem",
        medium: "1rem",
        large: "1.5rem",
        xLarge: "2rem",
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
        filter: "brightness(125%)",
    },
    active: {
        filter: "brightness(75%)",
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

export const FOCUS_RING_WIDTH = 2;

globalStyle(":focus-visible", {
    outline: `${FOCUS_RING_WIDTH}px solid ${themeVars.color.outline.main}`,
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
