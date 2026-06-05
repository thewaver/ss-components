import { createSignal } from "solid-js";

import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import {
    ScanlineAnimationBreakpoints,
    ScanlineAnimationKeyframes,
} from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

const BREAKPOINTS = [
    [0.35, 0.35, 0.45, 0.45],
    [0.45, 0.45, 0.55, 0.55],
    [0.55, 0.55, 0.65, 0.65],
] as ScanlineAnimationBreakpoints.BreakpointTupleQuad[];

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

const getRandomKeyframes = (lineCount: number, opts: ScanlineAnimationKeyframes.HorizontalShiftOpts) =>
    Array.from({ length: lineCount }, () =>
        ScanlineAnimationKeyframes.getRandomHorizontalShiftKeyframes(BREAKPOINTS, opts),
    );

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        keyframeOpts: ScanlineAnimationKeyframes.HorizontalShiftOpts;
    }>;

export const GlitchExample = ({ getKeyframeOpts, ...otherProps }: Props) => {
    const [getKeyframes, setKeyframes] = createSignal(getRandomKeyframes(otherProps.getLineCount(), getKeyframeOpts()));

    return (
        <ScanlineAnimation
            {...otherProps}
            getRootAnimationKeyframes={() => ROOT_KEYFRAMES}
            getScanlineAnimationKeyframes={(getIndex) => getKeyframes()[getIndex()]}
            onAnimationEnd={() => {
                setKeyframes(getRandomKeyframes(otherProps.getLineCount(), getKeyframeOpts()));
            }}
        />
    );
};
