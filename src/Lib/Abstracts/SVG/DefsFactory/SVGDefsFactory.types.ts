import { Point2d } from "@thewaver/ss-utils";

type SVGBaseDefs = {};

type SVGGradientDefs = SVGBaseDefs & {
    colors: {
        value: string;
        stop: number;
    }[];
    spreadMethod?: "pad" | "reflect" | "repeat";
};

export type SVGLinearGradientDefs = SVGGradientDefs & {
    angle: number;
};

export type SVGRadialGradientDefs = SVGGradientDefs & {
    origin: Point2d;
};

export type SVGDropShadowFilterDefs = SVGBaseDefs & {
    dx: number;
    dy: number;
    stdDeviation: number;
    floodColor: string;
    floodOpacity: number;
};

export type SVGGaussianBlurFilterDefs = SVGBaseDefs & {
    stdDeviation: number;
};

export type SVGSaturationFilterDefs = SVGBaseDefs & {
    amount: number;
};

export type SVGHueRotationFilterDefs = SVGBaseDefs & {
    deg: number;
};

export type SVGBrightnessFilterDefs = SVGBaseDefs & {
    amount: number;
};

export type SVGContrastFilterDefs = SVGBaseDefs & {
    amount: number;
};

export type SVGInversionFilterDefs = SVGBaseDefs & {
    amount: number;
};
