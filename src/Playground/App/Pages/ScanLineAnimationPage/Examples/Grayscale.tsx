import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationBreakpoints } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import { ScanlineAnimationKeyframesConst } from "../../../Samples/ScanlineAnimation.const";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        breakpointOpts: ScanlineAnimationBreakpoints.BreakpointOpts;
        keyframeOpts: ScanlineAnimationKeyframesConst.HorizontalGrayscaleOpts;
    }>;

export const GrayscaleExample = ({ getKeyframeOpts, getBreakpointOpts, getOrder, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            computeScanlineAnimation={(index, lineCount, timeline) =>
                ScanlineAnimationKeyframesConst.computeHorizontalGrayscale(
                    ScanlineAnimationBreakpoints.computeBreakpoints(
                        getOrder(),
                        index,
                        lineCount,
                        {},
                        getBreakpointOpts(),
                    ),
                    index,
                    timeline,
                    getKeyframeOpts(),
                )
            }
        />
    );
};
