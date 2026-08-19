import { Label } from "../../../../../Lib/Fundamentals/Input/Label/Label";
import { NumberInput } from "../../../../../Lib/Fundamentals/Input/NumberInput/NumberInput";
import { PageLabelCaption } from "../../../StyledComponents/LabelCaption/LabelCaption";
import { PageNumberInputStepper } from "../../../StyledComponents/NumberInputStepper/NumberInputStepper";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { FIELD_WIDTH } from "../NumberInputPage.const";
import type { NumberInputExampleProps } from "../NumberInputPage.types";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

const LABEL_GAP = 5;
const GUEST_MIN = 1;
const GUEST_MAX = 8;

type Props = NumberInputExampleProps;

export const LabelledExample = (props: Props) => (
    <Label getDir={() => "column"} getGap={() => LABEL_GAP}>
        <PageLabelCaption>Guests</PageLabelCaption>

        <NumberInput
            valueSignal={props.valueSignal}
            getMin={() => GUEST_MIN}
            getMax={() => GUEST_MAX}
            getPadding={() => FIELD_STEPPER_PADDING}
            getGap={() => FIELD_GAP}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />}
            renderTrailing={(getFlags, stepper) => <PageNumberInputStepper getFlags={getFlags} stepper={stepper} />}
        />
    </Label>
);
