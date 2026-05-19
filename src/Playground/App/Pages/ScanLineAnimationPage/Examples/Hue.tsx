import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationBreakpoints, ScanlineAnimationKeyframes } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        breakpointOpts: ScanlineAnimationBreakpoints.BreakpointOpts;
        keyframeOpts: ScanlineAnimationKeyframes.HorizontalHueOpts;
    }>;

export const HueExample = ({ getKeyframeOpts, getBreakpointOpts, getOrder, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            getScanlineAnimationKeyframes={(getIndex, getLineCount) =>
                ScanlineAnimationKeyframes.getHorizontalHueKeyframes(
                    ScanlineAnimationBreakpoints.getBreakpoints(getOrder(), getIndex(), getLineCount(), {}, getBreakpointOpts()),
                    getKeyframeOpts(),
                )
            }
        />
    );
};
