import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import knight from "../../../knight.png";

type Props = AccessorProps<{
    lineCount: number;
    animationDurationMs: number;
    opts: ScanlineAnimationUtils.HorizontalPulseOpts;
}>;

export const SurgeExample = (props: Props) => {
    return (
        <ScanlineAnimation
            getSrc={() => knight}
            getLineCount={props.getLineCount}
            getAnimationDurationMs={props.getAnimationDurationMs}
            getScanlineAnimationKeyframes={(getIndex) =>
                ScanlineAnimationUtils.getHorizontalPulseKeyframes(getIndex(), props.getLineCount(), props.getOpts())
            }
        />
    );
};
