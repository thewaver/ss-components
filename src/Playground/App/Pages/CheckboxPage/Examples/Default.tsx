import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import type { CheckboxExampleProps } from "../CheckboxPage.types";

type Props = CheckboxExampleProps;

export const DefaultExample = (props: Props) => (
    <Checkbox
        checkedSignal={props.checkedSignal}
        ariaLabel={"Default checkbox"}
        renderContent={(getFlags) => <PageCheckboxContent flags={getFlags} />}
    />
);
