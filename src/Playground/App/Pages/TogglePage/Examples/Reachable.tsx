import { Toggle } from "../../../../../Lib/Fundamentals/Input/Toggle/Toggle";
import { PageToggleContent } from "../../../StyledComponents/ToggleContent/ToggleContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { ToggleExampleProps } from "../TogglePage.types";

type Props = ToggleExampleProps;

export const ReachableExample = (props: Props) => (
    <Toggle
        checkedSignal={props.checkedSignal}
        getAriaLabel={() => "Disabled but reachable toggle"}
        getIsDisabled={() => true}
        getIsReachableWhenDisabled={() => true}
        renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
        getTooltipDefs={() => ({
            getPlacement: () => ({ x: "center", y: "top-out" }),
            getOffset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    getVisibilityTarget={getVisibilityTarget}
                    getTransitionDurationMs={getTransitionDurationMs}
                >
                    Focusable so this tooltip can be read, but clicking and pressing Space must leave it on.
                </PageTooltipContent>
            ),
        })}
    />
);
