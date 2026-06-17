import type { AccessorProps } from "../../Utils/typeUtils";

export type ScanlineAnimationController = {
    start: () => void;
    stop: () => void;
};

export type ScanlineAnimationProps = AccessorProps<{
    src: string;
    sizeAnchor?: "width" | "height";
    lineCount: number;
    animationDurationMs?: number;
    animationIterationCount?: number;
    animationIterationDelayMs?: number;
    rootAnimationKeyframes?: Keyframe[];
    getController?: (controller: ScanlineAnimationController) => void;
    getScanlineAnimationKeyframes: (getIndex: () => number, getLineCount: () => number) => Keyframe[];
    onAnimationEnd?: () => void;
}>;
