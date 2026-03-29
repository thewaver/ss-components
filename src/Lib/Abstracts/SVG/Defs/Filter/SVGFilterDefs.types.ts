type SVGBaseFilterDefs = {};

export type SVGDropShadowFilterDefs = SVGBaseFilterDefs & {
    dx: number;
    dy: number;
    stdDeviation: number;
    floodColor: string;
    floodOpacity: number;
};

export type SVGGaussianBlurFilterDefs = SVGBaseFilterDefs & {
    stdDeviation: number;
};

export type SVGSaturationFilterDefs = SVGBaseFilterDefs & {
    amount: number;
};

export type SVGHueRotationFilterDefs = SVGBaseFilterDefs & {
    deg: number;
};

export type SVGBrightnessFilterDefs = SVGBaseFilterDefs & {
    amount: number;
};

export type SVGContrastFilterDefs = SVGBaseFilterDefs & {
    amount: number;
};

export type SVGInversionFilterDefs = SVGBaseFilterDefs & {
    amount: number;
};
