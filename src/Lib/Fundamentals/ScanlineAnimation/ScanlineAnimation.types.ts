import type { AccessorProps } from "../../Utils/typeUtils";
import type {
    CellAnimationController,
    CellAnimationEvaluationDefs,
    CellAnimationEvaluationResult,
    CellAnimationProps,
} from "../CellAnimation/CellAnimation.types";
import type { CellAnimationWeights } from "../CellAnimation/CellAnimation.utils";

export type ScanlineAnimationEvaluationDefs = CellAnimationEvaluationDefs;

export type ScanlineAnimationEvaluationResult = CellAnimationEvaluationResult;

export type ScanlineAnimationController = CellAnimationController;

export type ScanlineAnimationProps = Omit<
    CellAnimationProps,
    "getCellCount" | "computeCellAnimation" | "getOriginType" | "getWeightType"
> &
    AccessorProps<{
        lineCount: number;
        weightType?: CellAnimationWeights.OriginFreeWeightType;
        computeScanlineAnimation: (
            defs: ScanlineAnimationEvaluationDefs,
            timeline: number,
        ) => ScanlineAnimationEvaluationResult;
    }>;
