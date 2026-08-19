import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import { PageSelectContent } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { AIRPORTS, PLACEHOLDER, renderSelectPopup } from "../SelectPage.const";
import type { SelectAirportExampleProps } from "../SelectPage.types";

type Props = SelectAirportExampleProps;

export const AirportsExample = (props: Props) => (
    <Select
        valueSignal={props.valueSignal}
        getOptions={() => AIRPORTS}
        getAriaLabel={() => "Airport"}
        renderContent={(getSelectedOption, getFlags) => (
            <PageSelectContent getFlags={getFlags}>
                {getSelectedOption() ? getSelectedOption()!.value.city : PLACEHOLDER}
            </PageSelectContent>
        )}
        renderOption={(getOption, getFlags) => (
            <PageSelectOptionContent getFlags={getFlags}>
                {getOption().value.city} ({getOption().value.code})
            </PageSelectOptionContent>
        )}
        renderPopup={renderSelectPopup}
    />
);
