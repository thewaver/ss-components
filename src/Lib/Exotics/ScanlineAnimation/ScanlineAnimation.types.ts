import type { AccessorProps } from "../../Utils/typeUtils";
import type {
    CellAnimationEvaluationDefs,
    CellAnimationEvaluationResult,
    CellAnimationProps,
} from "../CellAnimation/CellAnimation.types";

export type ScanlineAnimationEvaluationDefs = CellAnimationEvaluationDefs;

export type ScanlineAnimationEvaluationResult = CellAnimationEvaluationResult;

export type ScanlineAnimationProps = Omit<CellAnimationProps, "getCellCount" | "computeCellAnimation"> &
    AccessorProps<{
        lineCount: number;
        computeScanlineAnimation: (
            defs: ScanlineAnimationEvaluationDefs,
            timeline: number,
        ) => ScanlineAnimationEvaluationResult;
    }>;
