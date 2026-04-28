import { AccessorProps } from "../../Utils/typeUtils";

export type ScanlineAnimationProps = AccessorProps<{
    src: string;
    lineCount: number;
    animationDurationMs?: number;
    animationIterationCount?: number;
    rootAnimationKeyframes?: Keyframe[];
    getScanlineAnimationKeyframes: (getIndex: () => number) => Keyframe[];
    onAnimationEnd?: () => void;
}>;
