import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { Label } from "../../../../../Lib/Fundamentals/Input/Label/Label";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import { PageLabelCaption } from "../../../StyledComponents/LabelCaption/LabelCaption";
import type { LabelExampleProps } from "../LabelPage.types";

const GAP = 5;

type Props = LabelExampleProps;

export const ColumnExample = (props: Props) => (
    <Label getDir={() => "column"} getGap={() => GAP}>
        <PageLabelCaption>Stacked</PageLabelCaption>

        <Checkbox
            checkedSignal={props.checkedSignal}
            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
        />
    </Label>
);
