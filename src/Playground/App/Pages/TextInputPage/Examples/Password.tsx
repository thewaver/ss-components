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
        getPadding={() => FIELD_PADDING}
        getGap={() => FIELD_GAP}
        getType={() => (props.revealSignal[0]() ? "text" : "password")}
        getAriaLabel={() => "Password"}
        getAutoComplete={() => "current-password"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent getFlags={getFlags} />}
        renderPlaceholder={(getFlags) => (
            <PageTextFieldPlaceholder getFlags={getFlags}>Password</PageTextFieldPlaceholder>
        )}
        renderTrailing={() => (
            <Button
                onClick={() => {
                    props.revealSignal[1]((prev) => !prev);
                }}
                renderContent={(getFlags) => (
                    <PageTextFieldAdornment getFlags={getFlags}>
                        {props.revealSignal[0]() ? "Hide" : "Show"}
                    </PageTextFieldAdornment>
                )}
            />
        )}
    />
);
