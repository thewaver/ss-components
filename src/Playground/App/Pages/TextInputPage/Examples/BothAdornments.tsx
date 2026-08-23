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
        padding={() => FIELD_PADDING}
        gap={() => FIELD_GAP}
        ariaLabel={"Amount"}
        inputMode={"decimal"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} />}
        renderPlaceholder={(getFlags) => <PageTextFieldPlaceholder flags={getFlags}>0.00</PageTextFieldPlaceholder>}
        renderLeading={(getFlags) => <PageTextFieldAdornment flags={getFlags}>USD</PageTextFieldAdornment>}
        renderTrailing={() => (
            <Button
                isDisabled={() => props.valueSignal[0]() === ""}
                onClick={() => {
                    props.valueSignal[1]("");
                }}
                renderContent={(getFlags) => <PageTextFieldAdornment flags={getFlags}>Clear</PageTextFieldAdornment>}
            />
        )}
    />
);
