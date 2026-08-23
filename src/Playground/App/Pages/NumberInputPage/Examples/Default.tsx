import { NumberInput } from "../../../../../Lib/Fundamentals/Input/NumberInput/NumberInput";
import { PageNumberInputStepper } from "../../../StyledComponents/NumberInputStepper/NumberInputStepper";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import { FIELD_WIDTH } from "../NumberInputPage.const";
import type { NumberInputExampleProps } from "../NumberInputPage.types";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = NumberInputExampleProps;

export const DefaultExample = (props: Props) => (
    <NumberInput
        valueSignal={props.valueSignal}
        padding={() => FIELD_STEPPER_PADDING}
        gap={() => FIELD_GAP}
        ariaLabel={"How many"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} />}
        renderPlaceholder={(getFlags) => <PageTextFieldPlaceholder flags={getFlags}>How many</PageTextFieldPlaceholder>}
        renderTrailing={(getFlags, stepper) => <PageNumberInputStepper flags={getFlags} stepper={stepper} />}
    />
);
