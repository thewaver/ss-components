import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { PageControlRow, PageControlRowLabel } from "../../../PageComponents/ControlRow/ControlRow";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { CheckboxMixedExampleProps } from "../CheckboxPage.types";

type Props = CheckboxMixedExampleProps;

export const MixedExample = (props: Props) => {
    return (
        <PageControlRow>
            <Checkbox
                checkedSignal={props.allSignal}
                isMixed={props.isMixed}
                id={"selectAll"}
                ariaLabel={"Select all"}
                renderContent={(getFlags) => <PageCheckboxContent flags={getFlags} />}
                tooltipDefs={() => ({
                    placement: () => ({ x: "center", y: "top-out" }),
                    offset: () => ({ x: 0, y: 5 }),
                    renderContent: (getVisibilityTarget, getTransitionDurationMs, _getPlacement, getFlags) => (
                        <PageTooltipContent
                            visibilityTarget={getVisibilityTarget}
                            transitionDurationMs={getTransitionDurationMs}
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
                id={"firstChild"}
                ariaLabel={"First child"}
                renderContent={(getFlags) => <PageCheckboxContent flags={getFlags} />}
            />

            <Checkbox
                checkedSignal={props.secondChildSignal}
                ariaLabel={"Second child"}
                renderContent={(getFlags) => <PageCheckboxContent flags={getFlags} />}
            />
        </PageControlRow>
    );
};
