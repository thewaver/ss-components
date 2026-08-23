import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { PageControlRow, PageControlRowLabel } from "../../../PageComponents/ControlRow/ControlRow";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import type { CheckboxRefusedWriteExampleProps } from "../CheckboxPage.types";

type Props = CheckboxRefusedWriteExampleProps;

export const RefusedWriteExample = (props: Props) => (
    <PageControlRow>
        <Checkbox
            checkedSignal={props.emailSignal}
            id={"email"}
            ariaLabel={"Email"}
            renderContent={(getFlags) => <PageCheckboxContent flags={getFlags} />}
            onChange={(isChecked) => {
                if (isChecked || props.smsSignal[0]()) return;

                props.emailSignal[1](true);
            }}
        />

        <PageControlRowLabel>or</PageControlRowLabel>

        <Checkbox
            checkedSignal={props.smsSignal}
            ariaLabel={"SMS"}
            renderContent={(getFlags) => <PageCheckboxContent flags={getFlags} />}
            onChange={(isChecked) => {
                if (isChecked || props.emailSignal[0]()) return;

                props.smsSignal[1](true);
            }}
        />
    </PageControlRow>
);
