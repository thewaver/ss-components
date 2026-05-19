import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationBreakpoints, ScanlineAnimationKeyframes } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        breakpointOpts: ScanlineAnimationBreakpoints.BreakpointOpts;
        keyframeOpts: ScanlineAnimationKeyframes.HorizontalStretchOpts;
    }>;

export const SurgeExample = ({ getKeyframeOpts, getBreakpointOpts, getOrder, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            getScanlineAnimationKeyframes={(getIndex, getLineCount) =>
                ScanlineAnimationKeyframes.getHorizontalStretchKeyframes(
                    ScanlineAnimationBreakpoints.getBreakpoints(getOrder(),  getIndex(), getLineCount(), {}, getBreakpointOpts()), 
                    getKeyframeOpts(),
                )
            }
        />
    );
};
