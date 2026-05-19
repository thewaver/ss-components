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
        keyframeOpts: ScanlineAnimationKeyframes.HorizontalSnakeOpts;
    }>;

export const SnakeExample = ({ getKeyframeOpts, getBreakpointOpts, getOrder, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            getScanlineAnimationKeyframes={(getIndex, getLineCount) =>
                ScanlineAnimationKeyframes.getHorizontalSnakeKeyframes(
                    ScanlineAnimationBreakpoints.getBreakpoints(
                        getOrder(),
                        getIndex(),
                        getLineCount(),
                        {},
                        getBreakpointOpts(),
                    ),
                    getKeyframeOpts(),
                )
            }
        />
    );
};
