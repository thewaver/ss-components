import { TextInput } from "../../../../../Lib/Fundamentals/Input/TextInput/TextInput";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import { PIN_LENGTH } from "../TextInputPage.const";
import type { TextInputExampleProps } from "../TextInputPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TextInputExampleProps;

export const RefusingSetterExample = (props: Props) => (
    <TextInput
        valueSignal={props.valueSignal}
        getPadding={() => FIELD_PADDING}
        getGap={() => FIELD_GAP}
        getAriaLabel={() => "PIN"}
        getInputMode={() => "numeric"}
        getHasError={() => props.valueSignal[0]().length > 0 && props.valueSignal[0]().length < PIN_LENGTH}
        onInput={(value) => {
            props.valueSignal[1](value.replace(/\D/g, "").slice(0, PIN_LENGTH));
        }}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent getFlags={getFlags} />}
        renderPlaceholder={(getFlags) => (
            <PageTextFieldPlaceholder getFlags={getFlags}>Digits only</PageTextFieldPlaceholder>
        )}
    />
);
