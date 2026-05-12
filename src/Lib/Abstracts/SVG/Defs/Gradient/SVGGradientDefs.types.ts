import { Point2d } from "@thewaver/ss-utils";

type SVGBaseGradientDefs = {
    id: string;
};

type SVGGradientDefs = SVGBaseGradientDefs & {
    colors: {
        value: string;
        stop?: number;
    }[];
    spreadMethod?: "pad" | "reflect" | "repeat";
};

export type SVGLinearGradientDefs = SVGGradientDefs & {
    angle?: number;
};

export type SVGRadialGradientDefs = SVGGradientDefs & {
    origin: Point2d;
};

export type SVGDropShadowFilterDefs = SVGBaseGradientDefs & {
    dx: number;
    dy: number;
    stdDeviation: number;
    floodColor: string;
    floodOpacity: number;
};

export type SVGGaussianBlurFilterDefs = SVGBaseGradientDefs & {
    stdDeviation: number;
};
