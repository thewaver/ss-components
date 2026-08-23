import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { TextInput } from "../../../../../Lib/Fundamentals/Input/TextInput/TextInput";
import { PageTextFieldAdornment } from "../../../StyledComponents/TextFieldAdornment/TextFieldAdornment";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import type { TextInputPasswordExampleProps } from "../TextInputPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TextInputPasswordExampleProps;

export const PasswordExample = (props: Props) => (
    <TextInput
        valueSignal={props.valueSignal}
        padding={() => FIELD_PADDING}
        gap={() => FIELD_GAP}
        type={() => (props.revealSignal[0]() ? "text" : "password")}
        ariaLabel={"Password"}
        autoComplete={"current-password"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} />}
        renderPlaceholder={(getFlags) => <PageTextFieldPlaceholder flags={getFlags}>Password</PageTextFieldPlaceholder>}
        renderTrailing={() => (
            <Button
                onClick={() => {
                    props.revealSignal[1]((prev) => !prev);
                }}
                renderContent={(getFlags) => (
                    <PageTextFieldAdornment flags={getFlags}>
                        {props.revealSignal[0]() ? "Hide" : "Show"}
                    </PageTextFieldAdornment>
                )}
            />
        )}
    />
);
