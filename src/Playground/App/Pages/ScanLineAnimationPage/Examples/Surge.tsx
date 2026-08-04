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
        keyframeOpts: ScanlineAnimationKeyframes.HorizontalStretchOpts;
    }>;

export const SurgeExample = ({ getKeyframeOpts, getBreakpointOpts, getOrder, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            computeScanlineAnimation={(index, lineCount, timeline) =>
                ScanlineAnimationKeyframes.computeHorizontalStretch(
                    ScanlineAnimationBreakpoints.computeBreakpoints(getOrder(), index, lineCount, {}, getBreakpointOpts()),
                    index,
                    timeline,
                    getKeyframeOpts(),
                )
            }
        />
    );
};
