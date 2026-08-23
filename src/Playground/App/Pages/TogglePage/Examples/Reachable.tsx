import { Toggle } from "../../../../../Lib/Fundamentals/Input/Toggle/Toggle";
import { PageToggleContent } from "../../../StyledComponents/ToggleContent/ToggleContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { ToggleExampleProps } from "../TogglePage.types";

type Props = ToggleExampleProps;

export const ReachableExample = (props: Props) => (
    <Toggle
        checkedSignal={props.checkedSignal}
        ariaLabel={"Disabled but reachable toggle"}
        isDisabled={true}
        isReachableWhenDisabled={true}
        renderContent={(getFlags) => <PageToggleContent flags={getFlags} />}
        tooltipDefs={() => ({
            placement: () => ({ x: "center", y: "top-out" }),
            offset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    visibilityTarget={getVisibilityTarget}
                    transitionDurationMs={getTransitionDurationMs}
                >
                    Focusable so this tooltip can be read, but clicking and pressing Space must leave it on.
                </PageTooltipContent>
            ),
        })}
    />
);
