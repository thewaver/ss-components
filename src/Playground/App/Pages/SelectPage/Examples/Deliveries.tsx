import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import { PageSelectContent } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { DELIVERIES, PLACEHOLDER, renderSelectPopup } from "../SelectPage.const";
import type { SelectDeliveryExampleProps } from "../SelectPage.types";

type Props = SelectDeliveryExampleProps;

export const DeliveriesExample = (props: Props) => (
    <Select
        valueSignal={props.valueSignal}
        options={() => DELIVERIES}
        ariaLabel={"Delivery"}
        renderContent={(getSelectedOption, getFlags) => (
            <PageSelectContent flags={getFlags}>{getSelectedOption()?.value.name ?? PLACEHOLDER}</PageSelectContent>
        )}
        renderOption={(getOption, getFlags) => (
            <PageSelectOptionContent flags={getFlags} description={() => getOption().value.description}>
                {getOption().value.name}
            </PageSelectOptionContent>
        )}
        renderPopup={renderSelectPopup}
    />
);
