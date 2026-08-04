import { ScanlineAnimation } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import { ScanlineAnimationBreakpoints } from "../../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import { ScanlineAnimationKeyframesConst } from "../../../Samples/ScanlineAnimation.const";
import type { ScanlineAnimationExampleProps } from "../ScanlineAnimationPage.types";

type Props = ScanlineAnimationExampleProps &
    AccessorProps<{
        breakpointOpts: ScanlineAnimationBreakpoints.BreakpointOpts;
        keyframeOpts: ScanlineAnimationKeyframesConst.HorizontalHueOpts;
    }>;

export const HueExample = ({ getKeyframeOpts, getBreakpointOpts, getOrder, ...otherProps }: Props) => {
    return (
        <ScanlineAnimation
            {...otherProps}
            computeScanlineAnimation={(index, lineCount, timeline) =>
                ScanlineAnimationKeyframesConst.computeHorizontalHue(
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
