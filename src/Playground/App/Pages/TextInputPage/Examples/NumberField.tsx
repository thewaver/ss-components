import { TextInput } from "../../../../../Lib/Fundamentals/Input/TextInput/TextInput";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { QUANTITY_MAX, QUANTITY_MIN, QUANTITY_STEP } from "../TextInputPage.const";
import type { TextInputExampleProps } from "../TextInputPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TextInputExampleProps;

export const NumberFieldExample = (props: Props) => (
    <TextInput
        valueSignal={props.valueSignal}
        getPadding={() => FIELD_PADDING}
        getGap={() => FIELD_GAP}
        getType={() => "number"}
        getAriaLabel={() => "Quantity"}
        getMin={() => QUANTITY_MIN}
        getMax={() => QUANTITY_MAX}
        getStep={() => QUANTITY_STEP}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent getFlags={getFlags} />}
    />
);
