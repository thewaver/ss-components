import { ScanlineAnimation } from "../../../../../Lib/Exotics/ScanlineAnimation/ScanlineAnimation";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import { CellAnimationBreakpoints } from "../../../Samples/CellAnimationBreakpoints/CellAnimationBreakpoints.const";
import { CellAnimationWeights } from "../../../Samples/CellAnimationWeights/CellAnimationWeights.const";
import { ScanlineAnimationKeyframes } from "../../../Samples/ScanlineAnimationKeyframes/ScanlineAnimationKeyframes.const";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

const WEIGHT_ORIGIN = { x: 0, y: 0 };

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        breakpointOpts: CellAnimationBreakpoints.BreakpointOpts;
        keyframeOpts: ScanlineAnimationKeyframes.HorizontalGrayscaleOpts;
    }>;

export const GrayscaleExample = ({ getKeyframeOpts, getBreakpointOpts, getWeightType, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            computeCellWeights={(count) =>
                CellAnimationWeights.computeCellWeights(getWeightType(), count, WEIGHT_ORIGIN)
            }
            computeScanlineAnimation={(defs, timeline) =>
                ScanlineAnimationKeyframes.computeHorizontalGrayscale(
                    CellAnimationBreakpoints.computeBreakpoints(defs.weight, getBreakpointOpts()),
                    defs,
                    timeline,
                    getKeyframeOpts(),
                )
            }
        />
    );
};
