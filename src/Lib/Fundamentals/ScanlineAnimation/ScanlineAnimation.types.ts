import type { AccessorProps } from "../../Utils/typeUtils";

export type ScanlineAnimationProps = AccessorProps<{
    src: string;
    sizeAnchor?: "width" | "height";
    lineCount: number;
    animationDurationMs?: number;
    animationIterationCount?: number;
    animationIterationDelayMs?: number;
    rootAnimationKeyframes?: Keyframe[];
    getScanlineAnimationKeyframes: (getIndex: () => number, getLineCount: () => number) => Keyframe[];
    onAnimationEnd?: () => void;
}>;
