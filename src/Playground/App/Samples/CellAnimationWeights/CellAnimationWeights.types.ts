import type { Point2d } from "@thewaver/ss-utils";

export type WeightFn = (pos: Point2d, count: Point2d, origin: Point2d) => number;

export type WeightOpts = {
    shouldMakeUnique?: boolean;
    shouldNormalize?: boolean;
};
