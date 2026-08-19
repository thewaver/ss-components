import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { Label } from "../../../../../Lib/Fundamentals/Input/Label/Label";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import { PageLabelCaption } from "../../../StyledComponents/LabelCaption/LabelCaption";
import type { LabelExampleProps } from "../LabelPage.types";

type Props = LabelExampleProps;

export const DisabledExample = (props: Props) => (
    <Label>
        <Checkbox
            checkedSignal={props.checkedSignal}
            getIsDisabled={() => true}
            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
        />

        <PageLabelCaption getId={() => "disabledCaption"}>Caption clicks must do nothing</PageLabelCaption>
    </Label>
);
