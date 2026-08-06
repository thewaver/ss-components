import { CellAnimationBreakpoints } from "../../../../../Lib/Fundamentals/CellAnimation/CellAnimation.utils";
import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import { ScanlineAnimationKeyframesConst } from "../../../Samples/ScanlineAnimation.const";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        breakpointOpts: CellAnimationBreakpoints.BreakpointOpts;
        keyframeOpts: ScanlineAnimationKeyframesConst.HorizontalGrayscaleOpts;
    }>;

export const GrayscaleExample = ({ getKeyframeOpts, getBreakpointOpts, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            computeScanlineAnimation={(defs, timeline) =>
                ScanlineAnimationKeyframesConst.computeHorizontalGrayscale(
                    CellAnimationBreakpoints.computeBreakpoints(defs.weight, getBreakpointOpts()),
                    defs,
                    timeline,
                    getKeyframeOpts(),
                )
            }
        />
    );
};
