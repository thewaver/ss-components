import { ScanlineAnimation } from "../../../../../Lib/Exotics/ScanlineAnimation/ScanlineAnimation";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import { CellAnimationBreakpoints } from "../../../Samples/CellAnimationBreakpoints/CellAnimationBreakpoints.const";
import { ScanlineAnimationKeyframes } from "../../../Samples/ScanlineAnimationKeyframes/ScanlineAnimationKeyframes.const";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        breakpointOpts: CellAnimationBreakpoints.BreakpointOpts;
        keyframeOpts: ScanlineAnimationKeyframes.HorizontalSnakeOpts;
    }>;

export const SnakeExample = ({ getKeyframeOpts, getBreakpointOpts, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            computeScanlineAnimation={(defs, timeline) =>
                ScanlineAnimationKeyframes.computeHorizontalSnake(
                    CellAnimationBreakpoints.computeBreakpoints(defs.weight, getBreakpointOpts()),
                    defs,
                    timeline,
                    getKeyframeOpts(),
                )
            }
        />
    );
};
