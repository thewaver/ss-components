import { createMemo } from "solid-js";

import { CellAnimation } from "../../../../../Lib/Exotics/CellAnimation/CellAnimation";
import { access } from "../../../../../Lib/Utils/propUtils";
import { CellAnimationBreakpoints } from "../../../Samples/CellAnimationBreakpoints/CellAnimationBreakpoints.const";
import { CellAnimationKeyframes } from "../../../Samples/CellAnimationKeyframes/CellAnimationKeyframes.const";
import { CellAnimationOrigins } from "../../../Samples/CellAnimationOrigins/CellAnimationOrigins.const";
import { CellAnimationWeights } from "../../../Samples/CellAnimationWeights/CellAnimationWeights.const";
import type { CellAnimationExampleProps } from "../CellAnimationPage.types";

export const DefaultExample = ({
    animationType,
    breakpointOpts,
    originType,
    weightType,
    weightOpts,
    ...otherProps
}: CellAnimationExampleProps) => {
    const getOrigin = createMemo(() =>
        CellAnimationOrigins.computeOrigin(access(originType), access(otherProps.cellCount)),
    );

    return (
        <CellAnimation
            {...otherProps}
            computeCellWeights={(count) =>
                CellAnimationWeights.computeCellWeights(access(weightType), count, getOrigin(), access(weightOpts))
            }
            computeCellAnimation={(defs, timeline) =>
                CellAnimationKeyframes.computeAnimation(
                    access(animationType),
                    CellAnimationBreakpoints.computeBreakpoints(defs.weight, access(breakpointOpts)),
                    { ...defs, origin: getOrigin() },
                    timeline,
                )
            }
        />
    );
};
