import type { Signal } from "solid-js";

import { MultiSelect } from "../../../../../Lib/Fundamentals/Input/MultiSelect/MultiSelect";
import { PageSelectContent } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { COUNTRIES, PLACEHOLDER, renderSelectPopup } from "../SelectPage.const";

type Props = {
    valuesSignal: Signal<string[]>;
};

export const MultiSelectCountriesExample = (props: Props) => (
    <MultiSelect
        valuesSignal={props.valuesSignal}
        getOptions={() => COUNTRIES}
        getAriaLabel={() => "Countries"}
        renderContent={(getSelectedOptions, getFlags) => (
            <PageSelectContent getFlags={getFlags}>
                {getSelectedOptions().length
                    ? getSelectedOptions()
                          .map((option) => option.value)
                          .join(", ")
                    : PLACEHOLDER}
            </PageSelectContent>
        )}
        renderOption={(getOption, getFlags) => (
            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
        )}
        renderPopup={renderSelectPopup}
    />
);
