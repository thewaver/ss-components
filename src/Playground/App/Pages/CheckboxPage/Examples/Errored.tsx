import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import type { CheckboxExampleProps } from "../CheckboxPage.types";

type Props = CheckboxExampleProps;

export const ErroredExample = (props: Props) => (
    <Checkbox
        checkedSignal={props.checkedSignal}
        ariaLabel={"Errored checkbox"}
        hasError={() => !props.checkedSignal[0]()}
        renderContent={(getFlags) => <PageCheckboxContent flags={getFlags} />}
    />
);
