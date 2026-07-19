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
        keyframeOpts: ScanlineAnimationKeyframes.HorizontalGrayscaleOpts;
    }>;

export const BrightnessExample = ({ getKeyframeOpts, getBreakpointOpts, getOrder, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            evaluateScanlineAnimation={(getIndex, getLineCount, getTimeline) =>
                ScanlineAnimationKeyframes.evaluateHorizontalBrightness(
                    ScanlineAnimationBreakpoints.getBreakpoints(
                        getOrder(),
                        getIndex(),
                        getLineCount(),
                        {},
                        getBreakpointOpts(),
                    ),
                    getIndex(),
                    getTimeline(),
                    getKeyframeOpts(),
                )
            }
        />
    );
};
