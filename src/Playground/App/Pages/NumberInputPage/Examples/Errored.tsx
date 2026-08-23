import { NumberInput } from "../../../../../Lib/Fundamentals/Input/NumberInput/NumberInput";
import { PageNumberInputStepper } from "../../../StyledComponents/NumberInputStepper/NumberInputStepper";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { FIELD_WIDTH } from "../NumberInputPage.const";
import type { NumberInputExampleProps } from "../NumberInputPage.types";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = NumberInputExampleProps;

export const ErroredExample = (props: Props) => (
    <NumberInput
        valueSignal={props.valueSignal}
        min={0}
        hasError={() => (props.valueSignal[0]() ?? 0) <= 0}
        padding={() => FIELD_STEPPER_PADDING}
        gap={() => FIELD_GAP}
        ariaLabel={"Seats"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} />}
        renderTrailing={(getFlags, stepper) => <PageNumberInputStepper flags={getFlags} stepper={stepper} />}
    />
);
