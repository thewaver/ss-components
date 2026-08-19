import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { CheckboxExampleProps } from "../CheckboxPage.types";

type Props = CheckboxExampleProps;

export const ReachableExample = (props: Props) => (
    <Checkbox
        checkedSignal={props.checkedSignal}
        getAriaLabel={() => "Disabled but reachable checkbox"}
        getIsDisabled={() => true}
        getIsReachableWhenDisabled={() => true}
        renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
        getTooltipDefs={() => ({
            getPlacement: () => ({ x: "center", y: "top-out" }),
            getOffset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    getVisibilityTarget={getVisibilityTarget}
                    getTransitionDurationMs={getTransitionDurationMs}
                >
                    Focusable so this tooltip can be read, but clicking and pressing Space must leave it checked.
                </PageTooltipContent>
            ),
        })}
    />
);
