import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import { PageSelectContent } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectGroupContent } from "../../../StyledComponents/SelectGroupContent/SelectGroupContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { COUNTRIES, PLACEHOLDER, renderSelectPopup } from "../SelectPage.const";
import type { SelectExampleProps } from "../SelectPage.types";

type Props = SelectExampleProps & {
    getIsDisabled?: () => boolean;
    getHasError?: () => boolean;
    getHasGroups?: () => boolean;
};

export const CountriesExample = (props: Props) => (
    <Select
        valueSignal={props.valueSignal}
        getOptions={props.getOptions ?? (() => COUNTRIES)}
        getIsDisabled={props.getIsDisabled}
        getHasError={props.getHasError}
        getAriaLabel={() => "Country"}
        renderContent={(getSelectedOption, getFlags) => (
            <PageSelectContent getFlags={getFlags}>{getSelectedOption()?.value ?? PLACEHOLDER}</PageSelectContent>
        )}
        renderGroup={
            props.getHasGroups?.()
                ? (getGroup) => <PageSelectGroupContent>{getGroup().label}</PageSelectGroupContent>
                : undefined
        }
        renderOption={(getOption, getFlags) => (
            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
        )}
        renderPopup={renderSelectPopup}
    />
);
