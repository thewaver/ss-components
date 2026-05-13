import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ScanlineAnimationExampleProps = AccessorProps<{
    src: string;
    lineCount: number;
    animationDurationMs: number;
    animationIterationDelayMs: number;
}>;
