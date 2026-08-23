import { Range } from "../../../../../Lib/Fundamentals/Input/Range/Range";
import { PageRangeContent } from "../../../StyledComponents/RangeContent/RangeContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { RangeExampleProps } from "../RangePage.types";

import { RANGE_THUMB_SIZE } from "../../../StyledComponents/RangeContent/RangeContent.css";

type Props = RangeExampleProps;

export const ReachableExample = (props: Props) => (
    <Range
        valueSignal={props.valueSignal}
        ariaLabel={"Disabled but reachable range"}
        isDisabled={true}
        isReachableWhenDisabled={true}
        thumbSize={() => RANGE_THUMB_SIZE}
        renderContent={(getFlags) => <PageRangeContent flags={getFlags} />}
        tooltipDefs={() => ({
            placement: () => ({ x: "center", y: "top-out" }),
            offset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    visibilityTarget={getVisibilityTarget}
                    transitionDurationMs={getTransitionDurationMs}
                >
                    Focusable so this tooltip can be read, but arrow keys and dragging must leave the value where it is.
                </PageTooltipContent>
            ),
        })}
    />
);
