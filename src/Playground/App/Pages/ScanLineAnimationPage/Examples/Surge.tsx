import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import knight from "../../../knight.png";

const LINE_COUNT = 48;

export const SurgeExample = () => {
    return (
        <ScanlineAnimation
            getSrc={() => knight}
            getLineCount={() => LINE_COUNT}
            getAnimationDurationMs={() => 2000}
            getScanlineAnimationKeyframes={(getIndex) =>
                ScanlineAnimationUtils.getHorizontalPulseKeyframes(getIndex(), LINE_COUNT)
            }
        />
    );
};
