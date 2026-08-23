import { NumberInput } from "../../../../../Lib/Fundamentals/Input/NumberInput/NumberInput";
import { PageNumberInputStepper } from "../../../StyledComponents/NumberInputStepper/NumberInputStepper";
import { PageTextFieldAdornment } from "../../../StyledComponents/TextFieldAdornment/TextFieldAdornment";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { FIELD_WIDTH } from "../NumberInputPage.const";
import type { NumberInputExampleProps } from "../NumberInputPage.types";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = NumberInputExampleProps;

export const UnitExample = (props: Props) => (
    <NumberInput
        valueSignal={props.valueSignal}
        min={0}
        padding={() => FIELD_STEPPER_PADDING}
        gap={() => FIELD_GAP}
        ariaLabel={"Width"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} />}
        renderTrailing={(getFlags, stepper) => (
            <>
                <PageTextFieldAdornment flags={getFlags}>px</PageTextFieldAdornment>

                <PageNumberInputStepper flags={getFlags} stepper={stepper} />
            </>
        )}
    />
);
