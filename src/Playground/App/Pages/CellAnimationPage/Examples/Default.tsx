import { CellAnimation } from "../../../../../Lib/Fundamentals/CellAnimation/CellAnimation";
import { CellAnimationKeyframes } from "../../../Samples/CellAnimation.const";
import { CellAnimationBreakpoints } from "../../../Samples/CellAnimationBreakpoints.const";
import type { CellAnimationExampleProps } from "../CellAnimationPage.types";

export const DefaultExample = ({
    getAnimationType,
    getBreakpointOpts,
    getOrigin,
    ...otherProps
}: CellAnimationExampleProps) => {
    return (
        <CellAnimation
            {...otherProps}
            computeCellAnimation={(defs, timeline) =>
                CellAnimationKeyframes.computeAnimation(
                    getAnimationType(),
                    CellAnimationBreakpoints.computeBreakpoints(defs.weight, getBreakpointOpts()),
                    { ...defs, origin: getOrigin() },
                    timeline,
                )
            }
        />
    );
};
