import { createSignal } from "solid-js";

import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import { AccessorProps } from "../../../../../Lib/Utils/typeUtils";

const BREAKPOINTS = [
    [0.35, 0.35, 0.45, 0.45],
    [0.45, 0.45, 0.55, 0.55],
    [0.55, 0.55, 0.65, 0.65],
] as [number, number, number, number][];

const ROOT_KEYFRAMES: Keyframe[] = [
    { offset: 0, filter: "brightness(1)" },
    ...BREAKPOINTS.flatMap((breakpoint) => [
        { offset: breakpoint[0], filter: "brightness(1)" },
        { offset: breakpoint[1], filter: "brightness(1.25)" },
        { offset: breakpoint[2], filter: "brightness(1.25)" },
        { offset: breakpoint[3], filter: "brightness(1)" },
    ]),
    { offset: 1, filter: "brightness(1)" },
];

const getRandomKeyframes = (lineCount: number, opts: ScanlineAnimationUtils.HorizontalShiftOpts) =>
    Array.from({ length: lineCount }, () =>
        ScanlineAnimationUtils.getRandomHorizontalShiftKeyframes(BREAKPOINTS, opts),
    );

type Props = AccessorProps<{
    src: string;
    lineCount: number;
    animationDurationMs: number;
    opts: ScanlineAnimationUtils.HorizontalShiftOpts;
}>;

export const GlitchExample = (props: Props) => {
    const [getKeyframes, setKeyframes] = createSignal(getRandomKeyframes(props.getLineCount(), props.getOpts()));

    return (
        <ScanlineAnimation
            getSrc={props.getSrc}
            getLineCount={props.getLineCount}
            getAnimationDurationMs={props.getAnimationDurationMs}
            getRootAnimationKeyframes={() => ROOT_KEYFRAMES}
            getScanlineAnimationKeyframes={(getIndex) => getKeyframes()[getIndex()]}
            onAnimationEnd={() => {
                setKeyframes(getRandomKeyframes(props.getLineCount(), props.getOpts()));
            }}
        />
    );
};
