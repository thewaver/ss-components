import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import { PageSelectContent } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import { COUNTRIES, PLACEHOLDER, renderSelectPopup } from "../SelectPage.const";
import type { SelectExampleProps } from "../SelectPage.types";

type Props = SelectExampleProps;

export const ReachableExample = (props: Props) => {
    return (
        <Select
            valueSignal={props.valueSignal}
            options={() => COUNTRIES}
            isDisabled={true}
            isReachableWhenDisabled={true}
            ariaLabel={"Country"}
            renderContent={(getSelectedOption, getFlags) => (
                <PageSelectContent flags={getFlags}>{getSelectedOption()?.value ?? PLACEHOLDER}</PageSelectContent>
            )}
            renderOption={(getOption, getFlags) => (
                <PageSelectOptionContent flags={getFlags}>{getOption().value}</PageSelectOptionContent>
            )}
            renderPopup={renderSelectPopup}
            tooltipDefs={() => ({
                placement: () => ({ x: "center", y: "top-out" }),
                offset: () => ({ x: 0, y: 5 }),
                renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                    <PageTooltipContent
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getTransitionDurationMs}
                    >
                        Focusable so this can be read, but the list must not open.
                    </PageTooltipContent>
                ),
            })}
        />
    );
};
