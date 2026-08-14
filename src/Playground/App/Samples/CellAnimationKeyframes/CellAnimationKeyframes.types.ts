import type { CSSAnimationKey, Point2d } from "@thewaver/ss-utils";

import type {
    CellAnimationEvaluationDefs,
    CellAnimationEvaluationResult,
} from "../../../../Lib/Exotics/CellAnimation/CellAnimation.types";

export type CellStop = { at: number; originX?: number; originY?: number; depth?: number } & Partial<
    Record<CSSAnimationKey, number>
>;

export type CellStopTrack = { at: number; value: number }[];

export type CompiledCellStops = Record<string, CellStopTrack>;

export type CellAnimationFn = (
    timeline: number,
    defs: CellAnimationEvaluationDefs & { origin: Point2d },
) => CellAnimationEvaluationResult;
