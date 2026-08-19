import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { PageControlRow, PageControlRowLabel } from "../../../PageComponents/ControlRow/ControlRow";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { CheckboxMixedExampleProps } from "../CheckboxPage.types";

type Props = CheckboxMixedExampleProps;

export const MixedExample = (props: Props) => (
    <PageControlRow>
        <Checkbox
            checkedSignal={props.allSignal}
            getIsMixed={props.getIsMixed}
            getId={() => "selectAll"}
            getAriaLabel={() => "Select all"}
            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
            getTooltipDefs={() => ({
                getPlacement: () => ({ x: "center", y: "top-out" }),
                getOffset: () => ({ x: 0, y: 5 }),
                renderContent: (getVisibilityTarget, getTransitionDurationMs, _getPlacement, getFlags) => (
                    <PageTooltipContent
                        getVisibilityTarget={getVisibilityTarget}
                        getTransitionDurationMs={getTransitionDurationMs}
                    >
                        {`Summarises the two boxes on the right. It reads mixed whenever they disagree, and clicking it sets both. checkedState: ${String(getFlags().checkedState)}.`}
                    </PageTooltipContent>
                ),
            })}
            onChange={(isChecked) => {
                props.firstChildSignal[1](isChecked);
                props.secondChildSignal[1](isChecked);
            }}
        />

        <PageControlRowLabel>controls</PageControlRowLabel>

        <Checkbox
            checkedSignal={props.firstChildSignal}
            getId={() => "firstChild"}
            getAriaLabel={() => "First child"}
            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
        />

        <Checkbox
            checkedSignal={props.secondChildSignal}
            getAriaLabel={() => "Second child"}
            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
        />
    </PageControlRow>
);
