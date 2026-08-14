import { MathUtils } from "@thewaver/ss-utils";

import type { ScanlineAnimationEvaluationDefs, ScanlineAnimationEvaluationResult } from "../../../../Lib";
import type { CellAnimationBreakpoints } from "../CellAnimationBreakpoints/CellAnimationBreakpoints.const";

export namespace ScanlineAnimationKeyframes {
    const peak = (a: number, b: number, x: number) => {
        const mid = (a + b) * 0.5;

        if (x < a || x > b) return 0;
        if (x <= mid) return (x - a) / (mid - a);
        return (b - x) / (b - mid);
    };

    export type HorizontalSnakeOpts = {
        shiftPercent?: number;
    };

    const DEFAULT_HORIZONTAL_SNAKE_OPTS: Required<HorizontalSnakeOpts> = {
        shiftPercent: 5,
    };

    export const computeHorizontalSnake = (
        [b0, b1, b2]: CellAnimationBreakpoints.BreakpointTupleTriple,
        defs: ScanlineAnimationEvaluationDefs,
        t: number,
        opts?: HorizontalSnakeOpts,
    ): ScanlineAnimationEvaluationResult => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_SNAKE_OPTS, ...opts };
        const p = peak(b1, b2, t) - peak(b0, b1, t);

        return { translateX: mergedOpts.shiftPercent * p };
    };

    export type HorizontalSplitOpts = {
        shiftPercent?: number;
    };

    const DEFAULT_HORIZONTAL_SPLIT_OPTS: Required<HorizontalSplitOpts> = {
        shiftPercent: 10,
    };

    export const computeHorizontalSplit = (
        [b0, b1, b2]: CellAnimationBreakpoints.BreakpointTupleTriple,
        defs: ScanlineAnimationEvaluationDefs,
        t: number,
        opts?: HorizontalSplitOpts,
    ): ScanlineAnimationEvaluationResult => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_SPLIT_OPTS, ...opts };
        const dir = MathUtils.isEven(defs.pos.y) ? -1 : 1;
        const p = peak(b0, b2, t);

        return { translateX: dir * mergedOpts.shiftPercent * p };
    };

    export type HorizontalStretchOpts = {
        peakScalePercent?: number;
    };

    const DEFAULT_HORIZONTAL_STRETCH_OPTS: Required<HorizontalStretchOpts> = {
        peakScalePercent: 150,
    };

    export const computeHorizontalStretch = (
        [b0, b1, b2]: CellAnimationBreakpoints.BreakpointTupleTriple,
        defs: ScanlineAnimationEvaluationDefs,
        t: number,
        opts?: HorizontalStretchOpts,
    ): ScanlineAnimationEvaluationResult => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_STRETCH_OPTS, ...opts };
        const p = peak(b0, b2, t);

        return { scaleX: 100 + (mergedOpts.peakScalePercent - 100) * p };
    };

    export type HorizontalHueOpts = {};

    // const DEFAULT_HORIZONTAL_HUE_OPTS: Required<HorizontalHueOpts> = {};

    export const computeHorizontalHue = (
        [b0, b1, b2]: CellAnimationBreakpoints.BreakpointTupleTriple,
        defs: ScanlineAnimationEvaluationDefs,
        t: number,
        opts?: HorizontalHueOpts,
    ): ScanlineAnimationEvaluationResult => {
        // const mergedOpts = { ...DEFAULT_HORIZONTAL_HUE_OPTS, ...opts };
        const p = peak(b0, b2, t);

        return { "hue-rotate": 180 * p };
    };

    export type HorizontalBrightnessOpts = {};

    // const DEFAULT_HORIZONTAL_BRIGHTNESS_OPTS: Required<HorizontalBrightnessOpts> = {};

    export const computeHorizontalBrightness = (
        [b0, b1, b2]: CellAnimationBreakpoints.BreakpointTupleTriple,
        defs: ScanlineAnimationEvaluationDefs,
        t: number,
        opts?: HorizontalBrightnessOpts,
    ): ScanlineAnimationEvaluationResult => {
        // const mergedOpts = { ...DEFAULT_HORIZONTAL_BRIGHTNESS_OPTS, ...opts };
        const p = peak(b0, b2, t);

        return { brightness: 150 * p };
    };

    export type HorizontalGrayscaleOpts = {};

    // const DEFAULT_HORIZONTAL_GRAYSCALE_OPTS: Required<HorizontalGrayscaleOpts> = {};

    export const computeHorizontalGrayscale = (
        [b0, b1, b2]: CellAnimationBreakpoints.BreakpointTupleTriple,
        defs: ScanlineAnimationEvaluationDefs,
        t: number,
        opts?: HorizontalGrayscaleOpts,
    ): ScanlineAnimationEvaluationResult => {
        // const mergedOpts = { ...DEFAULT_HORIZONTAL_GRAYSCALE_OPTS, ...opts };
        const p = peak(b0, b2, t);

        return { grayscale: 100 * p };
    };
}
