import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { CheckboxExampleProps } from "../CheckboxPage.types";

type Props = CheckboxExampleProps;

export const ReachableExample = (props: Props) => (
    <Checkbox
        checkedSignal={props.checkedSignal}
        ariaLabel={"Disabled but reachable checkbox"}
        isDisabled={true}
        isReachableWhenDisabled={true}
        renderContent={(getFlags) => <PageCheckboxContent flags={getFlags} />}
        tooltipDefs={() => ({
            placement: () => ({ x: "center", y: "top-out" }),
            offset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    visibilityTarget={getVisibilityTarget}
                    transitionDurationMs={getTransitionDurationMs}
                >
                    Focusable so this tooltip can be read, but clicking and pressing Space must leave it checked.
                </PageTooltipContent>
            ),
        })}
    />
);
