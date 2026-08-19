import { TextInput } from "../../../../../Lib/Fundamentals/Input/TextInput/TextInput";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import type { TextInputExampleProps } from "../TextInputPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TextInputExampleProps;

export const DisabledExample = (props: Props) => (
    <TextInput
        valueSignal={props.valueSignal}
        getPadding={() => FIELD_PADDING}
        getGap={() => FIELD_GAP}
        getIsDisabled={() => true}
        getAriaLabel={() => "Disabled field"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent getFlags={getFlags} />}
    />
);
