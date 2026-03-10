export const COLOR_NAMES = ["RED", "YELLOW", "GREEN", "CYAN", "BLUE", "MAGENTA", "BROWN", "GRAY"] as const;
export type ColorName = (typeof COLOR_NAMES)[number];
export const COLOR_SHADES = ["000", "100", "200", "300", "400", "500", "600", "700", "800", "900", "1K0"] as const;
export type ColorShade = (typeof COLOR_SHADES)[number];
export type ColorKey = `${ColorName}_${ColorShade}` | "BLACK" | "WHITE" | "NEUTRAL";
export const COLOR_CONTEXT = ["layer0", "layer1", "layer2", "pro", "con", "info", "alert"] as const;
export type ColorContext = (typeof COLOR_CONTEXT)[number];
export const COLOR_ELEMENT = ["background", "border", "element", "text-main", "text-low", "text-high"] as const;
export type ColorElement = (typeof COLOR_ELEMENT)[number];

type Separator = "," | ", ";

export type RGBAColorString = `rgba(${number}${Separator}${number}${Separator}${number}${Separator}${number})`;

export type RGBAColor = {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
    a: number; // 0-1
};

export type HSLAColor = {
    h: number; // 0-360
    s: number; // 0-100
    l: number; // 0-100
    a: number; // 0-1
};
