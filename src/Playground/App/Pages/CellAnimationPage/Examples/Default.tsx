import { createMemo } from "solid-js";

import { CellAnimation } from "../../../../../Lib/Exotics/CellAnimation/CellAnimation";
import { CellAnimationBreakpoints } from "../../../Samples/CellAnimationBreakpoints/CellAnimationBreakpoints.const";
import { CellAnimationKeyframes } from "../../../Samples/CellAnimationKeyframes/CellAnimationKeyframes.const";
import { CellAnimationOrigins } from "../../../Samples/CellAnimationOrigins/CellAnimationOrigins.const";
import { CellAnimationWeights } from "../../../Samples/CellAnimationWeights/CellAnimationWeights.const";
import type { CellAnimationExampleProps } from "../CellAnimationPage.types";

export const DefaultExample = ({
    getAnimationType,
    getBreakpointOpts,
    getOriginType,
    getWeightType,
    getWeightOpts,
    ...otherProps
}: CellAnimationExampleProps) => {
    const getOrigin = createMemo(() => CellAnimationOrigins.computeOrigin(getOriginType(), otherProps.getCellCount()));

    return (
        <CellAnimation
            {...otherProps}
            computeCellWeights={(count) =>
                CellAnimationWeights.computeCellWeights(getWeightType(), count, getOrigin(), getWeightOpts())
            }
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
