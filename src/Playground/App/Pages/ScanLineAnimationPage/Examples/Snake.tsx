import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationUtils } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";

type Props = AccessorProps<{
    src: string;
    lineCount: number;
    animationDurationMs: number;
    opts: ScanlineAnimationUtils.HorizontalSwingOpts;
}>;

export const SnakeExample = (props: Props) => {
    return (
        <ScanlineAnimation
            getSrc={props.getSrc}
            getLineCount={props.getLineCount}
            getAnimationDurationMs={props.getAnimationDurationMs}
            getScanlineAnimationKeyframes={(getIndex) =>
                ScanlineAnimationUtils.getHorizontalSwingKeyframes(getIndex(), props.getLineCount(), props.getOpts())
            }
        />
    );
};
