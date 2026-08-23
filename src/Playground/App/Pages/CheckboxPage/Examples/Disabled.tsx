import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import type { CheckboxExampleProps } from "../CheckboxPage.types";

type Props = CheckboxExampleProps;

export const DisabledExample = (props: Props) => (
    <Checkbox
        checkedSignal={props.checkedSignal}
        ariaLabel={"Disabled checkbox"}
        isDisabled={true}
        renderContent={(getFlags) => <PageCheckboxContent flags={getFlags} />}
    />
);
