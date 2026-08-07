import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import { CellAnimationBreakpoints } from "../../../Samples/CellAnimationBreakpoints.const";
import { ScanlineAnimationKeyframes } from "../../../Samples/ScanlineAnimationKeyframes.const";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        breakpointOpts: CellAnimationBreakpoints.BreakpointOpts;
        keyframeOpts: ScanlineAnimationKeyframes.HorizontalGrayscaleOpts;
    }>;

export const BrightnessExample = ({ getKeyframeOpts, getBreakpointOpts, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            computeScanlineAnimation={(defs, timeline) =>
                ScanlineAnimationKeyframes.computeHorizontalBrightness(
                    CellAnimationBreakpoints.computeBreakpoints(defs.weight, getBreakpointOpts()),
                    defs,
                    timeline,
                    getKeyframeOpts(),
                )
            }
        />
    );
};
