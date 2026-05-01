import { createSignal } from "solid-js";

import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import knight from "../../../knight.png";

const LINE_COUNT = 48;
const MAX_SHIFT = 20;
const BREAKPOINTS = [0.4, 0.45, 0.55, 0.6] as [number, number, number, number];

const ROOT_KEYFRAMES: Keyframe[] = [
    { offset: 0, filter: "brightness(1)" },
    { offset: BREAKPOINTS[0], filter: "brightness(1)" },
    { offset: BREAKPOINTS[1], filter: "brightness(1.25)" },
    { offset: BREAKPOINTS[2], filter: "brightness(1.25)" },
    { offset: BREAKPOINTS[3], filter: "brightness(1)" },
    { offset: 1, filter: "brightness(1)" },
];

const getRandomKeyframes = () =>
    Array.from({ length: LINE_COUNT }, () =>
        ScanlineAnimationUtils.getHorizontalShiftKeyframes(Math.random() * MAX_SHIFT * 2 - MAX_SHIFT, BREAKPOINTS),
    );

export const GlitchExample = () => {
    const [getKeyframes, setKeyframes] = createSignal(getRandomKeyframes());

    return (
        <ScanlineAnimation
            getSrc={() => knight}
            getLineCount={() => LINE_COUNT}
            getAnimationDurationMs={() => 2000}
            getRootAnimationKeyframes={() => ROOT_KEYFRAMES}
            getScanlineAnimationKeyframes={(getIndex) => getKeyframes()[getIndex()]}
            onAnimationEnd={() => {
                setKeyframes(getRandomKeyframes());
            }}
        />
    );
};
