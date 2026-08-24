import { MathUtils } from "@thewaver/ss-utils";

import type { ScanlineAnimationEvaluationDefs, ScanlineAnimationEvaluationResult } from "../../../../Lib";
import type { CellAnimationBreakpoints } from "../CellAnimationBreakpoints/CellAnimationBreakpoints.const";
import { CellAnimationWeightUtils } from "../CellAnimationWeights/CellAnimationWeights.utils";

export namespace ScanlineAnimationKeyframes {
    const peak = (a: number, b: number, x: number) => {
        const mid = (a + b) * 0.5;

        if (x < a || x > b) return 0;
        if (x <= mid) return (x - a) / (mid - a);
        return (b - x) / (b - mid);
    };

    const ramp = (a: number, b: number, x: number) => {
        if (x <= a) return 0;
        if (x >= b) return 1;

        return (x - a) / (b - a);
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

    export type _HorizontalWaveOpts = {
        shiftPercent?: number;
        waveCount?: number;
    };

    const DEFAULT_HORIZONTAL_WAVE_OPTS: Required<_HorizontalWaveOpts> = {
        shiftPercent: 8,
        waveCount: 3,
    };

    export const _computeHorizontalWave = (
        [b0, b1, b2]: CellAnimationBreakpoints.BreakpointTupleTriple,
        defs: ScanlineAnimationEvaluationDefs,
        t: number,
        opts?: _HorizontalWaveOpts,
    ): ScanlineAnimationEvaluationResult => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_WAVE_OPTS, ...opts };
        const envelope = peak(b0, b2, t);
        const phase = ((defs.pos.y / Math.max(defs.count.y, 1)) * mergedOpts.waveCount + t) * Math.PI * 2;

        return { translateX: mergedOpts.shiftPercent * envelope * Math.sin(phase) };
    };

    export type _HorizontalRollOpts = {
        shiftPercent?: number;
        seamBrightnessPercent?: number;
    };

    const DEFAULT_HORIZONTAL_ROLL_OPTS: Required<_HorizontalRollOpts> = {
        shiftPercent: 100,
        seamBrightnessPercent: 40,
    };

    export const _computeHorizontalRoll = (
        [b0, b1, b2]: CellAnimationBreakpoints.BreakpointTupleTriple,
        defs: ScanlineAnimationEvaluationDefs,
        t: number,
        opts?: _HorizontalRollOpts,
    ): ScanlineAnimationEvaluationResult => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_ROLL_OPTS, ...opts };

        return {
            translateY: mergedOpts.shiftPercent * (1 - ramp(b0, b2, t)),
            brightness: 100 + mergedOpts.seamBrightnessPercent * peak(b0, b2, t),
        };
    };

    export type _HorizontalDropoutOpts = {
        dropChance?: number;
        shiftPercent?: number;
    };

    const DEFAULT_HORIZONTAL_DROPOUT_OPTS: Required<_HorizontalDropoutOpts> = {
        dropChance: 0.3,
        shiftPercent: 15,
    };

    export const _computeHorizontalDropout = (
        [b0, b1, b2]: CellAnimationBreakpoints.BreakpointTupleTriple,
        defs: ScanlineAnimationEvaluationDefs,
        t: number,
        opts?: _HorizontalDropoutOpts,
    ): ScanlineAnimationEvaluationResult => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_DROPOUT_OPTS, ...opts };

        if (CellAnimationWeightUtils._hashToUnit(defs.pos.y, defs.count.y) >= mergedOpts.dropChance) return {};

        const p = peak(b0, b2, t);

        return { opacity: 100 - 100 * p, translateX: mergedOpts.shiftPercent * p };
    };

    export type _HorizontalInterlaceOpts = {
        dipPercent?: number;
        fieldCount?: number;
    };

    const DEFAULT_HORIZONTAL_INTERLACE_OPTS: Required<_HorizontalInterlaceOpts> = {
        dipPercent: 40,
        fieldCount: 8,
    };

    export const _computeHorizontalInterlace = (
        [b0, b1, b2]: CellAnimationBreakpoints.BreakpointTupleTriple,
        defs: ScanlineAnimationEvaluationDefs,
        t: number,
        opts?: _HorizontalInterlaceOpts,
    ): ScanlineAnimationEvaluationResult => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_INTERLACE_OPTS, ...opts };
        const envelope = peak(b0, b2, t);
        const field = Math.sin(t * mergedOpts.fieldCount * Math.PI * 2);
        const dir = MathUtils.isEven(defs.pos.y) ? 1 : -1;

        return { brightness: 100 + mergedOpts.dipPercent * dir * field * envelope };
    };

    export type _HorizontalSkewOpts = {
        skewDegrees?: number;
    };

    const DEFAULT_HORIZONTAL_SKEW_OPTS: Required<_HorizontalSkewOpts> = {
        skewDegrees: 20,
    };

    export const _computeHorizontalSkew = (
        [b0, b1, b2]: CellAnimationBreakpoints.BreakpointTupleTriple,
        defs: ScanlineAnimationEvaluationDefs,
        t: number,
        opts?: _HorizontalSkewOpts,
    ): ScanlineAnimationEvaluationResult => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_SKEW_OPTS, ...opts };
        const p = peak(b1, b2, t) - peak(b0, b1, t);

        return { skewX: mergedOpts.skewDegrees * p };
    };
}
