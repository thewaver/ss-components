import { createSignal } from "solid-js";

import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import knight from "../../../knight.png";

const LINE_COUNT = 48;
const ROOT_KEYFRAMES: Keyframe[] = [
    { offset: 0, filter: "brightness(1)" },
    { offset: 0.4, filter: "brightness(1)" },
    { offset: 0.45, filter: "brightness(1.25)" },
    { offset: 0.55, filter: "brightness(1.25)" },
    { offset: 0.6, filter: "brightness(1)" },
    { offset: 1, filter: "brightness(1)" },
];

const getRandomKeyframes = () =>
    Array.from({ length: LINE_COUNT }, () =>
        ScanlineAnimationUtils.getRandomHorizontalShiftKeyframes(20, [0.4, 0.45, 0.55, 0.6]),
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
