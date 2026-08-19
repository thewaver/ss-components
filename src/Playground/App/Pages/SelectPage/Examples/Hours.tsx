import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import { PageSelectContent } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { HOURS, PLACEHOLDER, renderSelectPopup } from "../SelectPage.const";
import type { SelectExampleProps } from "../SelectPage.types";

type Props = SelectExampleProps;

export const HoursExample = (props: Props) => (
    <Select
        valueSignal={props.valueSignal}
        getOptions={() => HOURS}
        getAriaLabel={() => "Departure hour"}
        renderContent={(getSelectedOption, getFlags) => (
            <PageSelectContent getFlags={getFlags}>{getSelectedOption()?.value ?? PLACEHOLDER}</PageSelectContent>
        )}
        renderOption={(getOption, getFlags) => (
            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
        )}
        renderPopup={renderSelectPopup}
    />
);
