import { createSignal } from "solid-js";

import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import knight from "../../../knight.png";

const BREAKPOINTS = [0.4, 0.45, 0.55, 0.6] as [number, number, number, number];

const ROOT_KEYFRAMES: Keyframe[] = [
    { offset: 0, filter: "brightness(1)" },
    { offset: BREAKPOINTS[0], filter: "brightness(1)" },
    { offset: BREAKPOINTS[1], filter: "brightness(1.25)" },
    { offset: BREAKPOINTS[2], filter: "brightness(1.25)" },
    { offset: BREAKPOINTS[3], filter: "brightness(1)" },
    { offset: 1, filter: "brightness(1)" },
];

const getRandomKeyframes = (lineCount: number, maxShift: number) =>
    Array.from({ length: lineCount }, () =>
        ScanlineAnimationUtils.getHorizontalShiftKeyframes(Math.random() * maxShift * 2 - maxShift, BREAKPOINTS),
    );

type Props = AccessorProps<{
    lineCount: number;
    animationDurationMs: number;
    maxShift: number;
}>;

export const GlitchExample = (props: Props) => {
    const [getKeyframes, setKeyframes] = createSignal(getRandomKeyframes(props.getLineCount(), props.getMaxShift()));

    return (
        <ScanlineAnimation
            getSrc={() => knight}
            getLineCount={props.getLineCount}
            getAnimationDurationMs={props.getAnimationDurationMs}
            getRootAnimationKeyframes={() => ROOT_KEYFRAMES}
            getScanlineAnimationKeyframes={(getIndex) => getKeyframes()[getIndex()]}
            onAnimationEnd={() => {
                setKeyframes(getRandomKeyframes(props.getLineCount(), props.getMaxShift()));
            }}
        />
    );
};
