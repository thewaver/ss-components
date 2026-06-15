import { Point2d, Size2d } from "@thewaver/ss-utils";

type SVGBaseGradientDefs = {
    id: string;
};

type SVGGradientDefs = SVGBaseGradientDefs & {
    colors: {
        value: string;
        stop?: number;
    }[];
    spreadKind?: "smooth" | "banded";
    spreadMethod?: "pad" | "reflect" | "repeat";
};

export type SVGLinearGradientDefs = SVGGradientDefs & {
    angle?: number;
    scale?: Size2d;
    offset?: Point2d;
};

export type SVGRadialGradientDefs = SVGGradientDefs & {
    origin?: Point2d;
    scale?: number;
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
