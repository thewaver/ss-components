import { createSignal } from "solid-js";

import { ScanlineAnimation } from "../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import knight from "../../knight.png";

import * as styles from "./ScanlineAnimationPage.css";

const LINE_COUNT = 12;

const getRandomKeyframes = () =>
    Array.from({ length: LINE_COUNT }, () => ScanlineAnimationUtils.getRandomHorizontalShiftKeyframes(40, 40));

export const ScanlineAnimationPage = () => {
    const [getKeyframes, setKeyframes] = createSignal(getRandomKeyframes());

    return (
        <div class={styles.root}>
            <ScanlineAnimation
                getSrc={() => knight}
                getLineCount={() => LINE_COUNT}
                getScanlineAnimationKeyframes={(getIndex) => getKeyframes()[getIndex()]}
                onAnimationEnd={() => setKeyframes(getRandomKeyframes())}
            />
        </div>
    );
};
