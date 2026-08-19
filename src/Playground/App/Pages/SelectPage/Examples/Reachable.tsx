import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import { PageSelectContent } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import { COUNTRIES, PLACEHOLDER, renderSelectPopup } from "../SelectPage.const";
import type { SelectExampleProps } from "../SelectPage.types";

type Props = SelectExampleProps;

export const ReachableExample = (props: Props) => (
    <Select
        valueSignal={props.valueSignal}
        getOptions={() => COUNTRIES}
        getIsDisabled={() => true}
        getIsReachableWhenDisabled={() => true}
        getAriaLabel={() => "Country"}
        renderContent={(getSelectedOption, getFlags) => (
            <PageSelectContent getFlags={getFlags}>{getSelectedOption()?.value ?? PLACEHOLDER}</PageSelectContent>
        )}
        renderOption={(getOption, getFlags) => (
            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
        )}
        renderPopup={renderSelectPopup}
        getTooltipDefs={() => ({
            getPlacement: () => ({ x: "center", y: "top-out" }),
            getOffset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    getVisibilityTarget={getVisibilityTarget}
                    getTransitionDurationMs={getTransitionDurationMs}
                >
                    Focusable so this can be read, but the list must not open.
                </PageTooltipContent>
            ),
        })}
    />
);
