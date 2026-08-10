export type ColorValueRgb = {
    r: number;
    g: number;
    b: number;
};

export type ColorValueRgba = ColorValueRgb & {
    a: number;
};

export type ColorValueHsv = {
    h: number;
    s: number;
    v: number;
    a?: number;
};

export type ColorValueHsl = {
    h: number;
    s: number;
    l: number;
};

export type ColorValueSpace = "rgba" | "hsla" | "hexa";
