import { TextInput } from "../../../../../Lib/Fundamentals/Input/TextInput/TextInput";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import type { TextInputExampleProps } from "../TextInputPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TextInputExampleProps;

export const ErroredExample = (props: Props) => (
    <TextInput
        valueSignal={props.valueSignal}
        getPadding={() => FIELD_PADDING}
        getGap={() => FIELD_GAP}
        getType={() => "email"}
        getHasError={() => !props.valueSignal[0]().includes("@")}
        getAriaLabel={() => "Email"}
        getAutoComplete={() => "email"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent getFlags={getFlags} />}
    />
);
