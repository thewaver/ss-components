import { Label } from "../../../../../Lib/Fundamentals/Input/Label/Label";
import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import { PageLabelCaption } from "../../../StyledComponents/LabelCaption/LabelCaption";
import { PageSelectContent } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { COUNTRIES, PLACEHOLDER, renderSelectPopup } from "../SelectPage.const";
import type { SelectExampleProps } from "../SelectPage.types";

const LABEL_GAP = 5;

type Props = SelectExampleProps;

export const LabelledExample = (props: Props) => {
    return (
        <Label dir={"column"} gap={() => LABEL_GAP}>
            <PageLabelCaption>Country</PageLabelCaption>

            <Select
                valueSignal={props.valueSignal}
                options={() => COUNTRIES}
                renderContent={(getSelectedOption, getFlags) => (
                    <PageSelectContent flags={getFlags}>{getSelectedOption()?.value ?? PLACEHOLDER}</PageSelectContent>
                )}
                renderOption={(getOption, getFlags) => (
                    <PageSelectOptionContent flags={getFlags}>{getOption().value}</PageSelectOptionContent>
                )}
                renderPopup={renderSelectPopup}
            />
        </Label>
    );
};
