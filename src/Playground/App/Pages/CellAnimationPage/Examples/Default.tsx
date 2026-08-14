import { CellAnimation } from "../../../../../Lib/Exotics/CellAnimation/CellAnimation";
import { CellAnimationBreakpoints } from "../../../Samples/CellAnimationBreakpoints/CellAnimationBreakpoints.const";
import { CellAnimationKeyframes } from "../../../Samples/CellAnimationKeyframes/CellAnimationKeyframes.const";
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
