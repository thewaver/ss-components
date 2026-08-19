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
        getMin={() => 0}
        getPadding={() => FIELD_STEPPER_PADDING}
        getGap={() => FIELD_GAP}
        getAriaLabel={() => "Width"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />}
        renderTrailing={(getFlags, stepper) => (
            <>
                <PageTextFieldAdornment getFlags={getFlags}>px</PageTextFieldAdornment>

                <PageNumberInputStepper getFlags={getFlags} stepper={stepper} />
            </>
        )}
    />
);
