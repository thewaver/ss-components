import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import type { CheckboxExampleProps } from "../CheckboxPage.types";

type Props = CheckboxExampleProps;

export const ErroredExample = (props: Props) => (
    <Checkbox
        checkedSignal={props.checkedSignal}
        getAriaLabel={() => "Errored checkbox"}
        getHasError={() => !props.checkedSignal[0]()}
        renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
    />
);
