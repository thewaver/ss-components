import type { ScanlineAnimationController } from "../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.types";
import type { ScanlineAnimationBreakpoints } from "../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ScanlineAnimationExampleProps = AccessorProps<{
    src: string;
    lineCount: number;
    animationDurationMs: number;
    animationIterationDelayMs: number;
    order: ScanlineAnimationBreakpoints.OrderingType;
    getController: (controller: ScanlineAnimationController) => void;
}>;
