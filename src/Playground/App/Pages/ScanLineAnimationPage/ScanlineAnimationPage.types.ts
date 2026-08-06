import type { CellAnimationWeights } from "../../../../Lib/Fundamentals/CellAnimation/CellAnimation.utils";
import type { ScanlineAnimationController } from "../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ScanlineAnimationExampleProps = AccessorProps<{
    src: string;
    lineCount: number;
    animationDurationMs: number;
    animationIterationDelayMs: number;
    weightType: CellAnimationWeights.OriginFreeWeightType;
    onMount: (controller: ScanlineAnimationController) => void;
}>;
