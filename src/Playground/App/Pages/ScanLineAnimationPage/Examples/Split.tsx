import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import {
    ScanlineAnimationBreakpoints,
    ScanlineAnimationKeyframes,
} from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        breakpointOpts: ScanlineAnimationBreakpoints.BreakpointOpts;
        keyframeOpts: ScanlineAnimationKeyframes.HorizontalSplitOpts;
    }>;

export const SplitExample = ({ getKeyframeOpts, getBreakpointOpts, getOrder, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            evaluateScanlineAnimation={(index, lineCount, timeline) =>
                ScanlineAnimationKeyframes.evaluateHorizontalSplit(
                    ScanlineAnimationBreakpoints.getBreakpoints(getOrder(), index, lineCount, {}, getBreakpointOpts()),
                    index,
                    timeline,
                    getKeyframeOpts(),
                )
            }
        />
    );
};
