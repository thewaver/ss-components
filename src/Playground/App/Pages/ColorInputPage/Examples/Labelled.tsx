import { ColorInput } from "../../../../../Lib/Fundamentals/Input/ColorInput/ColorInput";
import { Label } from "../../../../../Lib/Fundamentals/Input/Label/Label";
import { pageColorPickerSlots } from "../../../StyledComponents/ColorAreaContent/ColorAreaContent";
import { PageColorInputContent } from "../../../StyledComponents/ColorInputContent/ColorInputContent";
import { PageLabelCaption } from "../../../StyledComponents/LabelCaption/LabelCaption";
import type { ColorInputExampleProps } from "../ColorInputPage.types";

const LABEL_GAP = 5;

type Props = ColorInputExampleProps;

export const LabelledExample = (props: Props) => (
    <Label dir={"column"} gap={() => LABEL_GAP}>
        <PageLabelCaption>Accent</PageLabelCaption>

        <ColorInput
            {...pageColorPickerSlots}
            valueSignal={props.valueSignal}
            renderContent={(getFlags) => <PageColorInputContent flags={getFlags} />}
        />
    </Label>
);
