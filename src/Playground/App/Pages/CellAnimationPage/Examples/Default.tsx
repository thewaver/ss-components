import { CellAnimation } from "../../../../../Lib/Fundamentals/CellAnimation/CellAnimation";
import { CellAnimationBreakpoints } from "../../../../../Lib/Fundamentals/CellAnimation/CellAnimation.utils";
import { CellAnimationKeyframesConst } from "../../../Samples/CellAnimation.const";
import type { CellAnimationExampleProps } from "../CellAnimationPage.types";

export const DefaultExample = ({ getAnimationType, getBreakpointOpts, ...otherProps }: CellAnimationExampleProps) => {
    return (
        <CellAnimation
            {...otherProps}
            computeCellAnimation={(defs, timeline) =>
                CellAnimationKeyframesConst.computeAnimation(
                    getAnimationType(),
                    CellAnimationBreakpoints.computeBreakpoints(defs.weight, getBreakpointOpts()),
                    defs,
                    timeline,
                )
            }
        />
    );
};
