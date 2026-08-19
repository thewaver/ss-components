import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { TextInput } from "../../../../../Lib/Fundamentals/Input/TextInput/TextInput";
import { PageTextFieldAdornment } from "../../../StyledComponents/TextFieldAdornment/TextFieldAdornment";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import type { TextInputExampleProps } from "../TextInputPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TextInputExampleProps;

export const BothAdornmentsExample = (props: Props) => (
    <TextInput
        valueSignal={props.valueSignal}
        getPadding={() => FIELD_PADDING}
        getGap={() => FIELD_GAP}
        getAriaLabel={() => "Amount"}
        getInputMode={() => "decimal"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent getFlags={getFlags} />}
        renderPlaceholder={(getFlags) => <PageTextFieldPlaceholder getFlags={getFlags}>0.00</PageTextFieldPlaceholder>}
        renderLeading={(getFlags) => <PageTextFieldAdornment getFlags={getFlags}>USD</PageTextFieldAdornment>}
        renderTrailing={() => (
            <Button
                getIsDisabled={() => props.valueSignal[0]() === ""}
                onClick={() => {
                    props.valueSignal[1]("");
                }}
                renderContent={(getFlags) => <PageTextFieldAdornment getFlags={getFlags}>Clear</PageTextFieldAdornment>}
            />
        )}
    />
);
