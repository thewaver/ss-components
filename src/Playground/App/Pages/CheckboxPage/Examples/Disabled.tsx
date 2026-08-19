import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import type { CheckboxExampleProps } from "../CheckboxPage.types";

type Props = CheckboxExampleProps;

export const DisabledExample = (props: Props) => (
    <Checkbox
        checkedSignal={props.checkedSignal}
        getAriaLabel={() => "Disabled checkbox"}
        getIsDisabled={() => true}
        renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
    />
);
