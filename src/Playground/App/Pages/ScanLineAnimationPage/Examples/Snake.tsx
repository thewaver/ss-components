import { ScanlineAnimation } from "../../../../../Lib/Exotics/ScanlineAnimation/ScanlineAnimation";
import { access } from "../../../../../Lib/Utils/propUtils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import { CellAnimationBreakpoints } from "../../../Samples/CellAnimationBreakpoints/CellAnimationBreakpoints.const";
import { CellAnimationWeights } from "../../../Samples/CellAnimationWeights/CellAnimationWeights.const";
import { ScanlineAnimationKeyframes } from "../../../Samples/ScanlineAnimationKeyframes/ScanlineAnimationKeyframes.const";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

const WEIGHT_ORIGIN = { x: 0, y: 0 };

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        breakpointOpts: CellAnimationBreakpoints.BreakpointOpts;
        keyframeOpts: ScanlineAnimationKeyframes.HorizontalSnakeOpts;
    }>;

export const SnakeExample = ({ keyframeOpts, breakpointOpts, weightType, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            computeCellWeights={(count) =>
                CellAnimationWeights.computeCellWeights(access(weightType), count, WEIGHT_ORIGIN)
            }
            computeScanlineAnimation={(defs, timeline) =>
                ScanlineAnimationKeyframes.computeHorizontalSnake(
                    CellAnimationBreakpoints.computeBreakpoints(defs.weight, access(breakpointOpts)),
                    defs,
                    timeline,
                    access(keyframeOpts),
                )
            }
        />
    );
};
