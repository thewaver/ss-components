import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { Label } from "../../../../../Lib/Fundamentals/Input/Label/Label";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import { PageLabelCaption } from "../../../StyledComponents/LabelCaption/LabelCaption";
import type { LabelExampleProps } from "../LabelPage.types";

type Props = LabelExampleProps;

export const SuppressedExample = (props: Props) => (
    <Label>
        <Checkbox
            checkedSignal={props.checkedSignal}
            getAriaLabel={() => "Announced as something else"}
            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
        />

        <PageLabelCaption>Subscribe to the newsletter</PageLabelCaption>
    </Label>
);
