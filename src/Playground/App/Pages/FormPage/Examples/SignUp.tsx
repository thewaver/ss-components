import type { Signal } from "solid-js";

import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { Form } from "../../../../../Lib/Fundamentals/Form/Form";
import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { FormField } from "../../../../../Lib/Fundamentals/Input/FormField/FormField";
import { TextInput } from "../../../../../Lib/Fundamentals/Input/TextInput/TextInput";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import {
    PageFormButtons,
    PageFormFieldCaption,
    PageFormFieldMessage,
    PageFormStack,
} from "../../../StyledComponents/FormFieldContent/FormFieldContent";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import type { FormExampleProps } from "../FormPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

const FIELD_WIDTH = 240;
const MIN_PASSWORD_LENGTH = 8;

type Props = FormExampleProps;

const renderTextField = (signal: Signal<string>, getHasError: () => boolean) => (
    <TextInput
        valueSignal={signal}
        hasError={getHasError}
        padding={() => FIELD_PADDING}
        gap={() => FIELD_GAP}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} />}
    />
);

export const SignUpExample = (props: Props) => {
    const getEmailMessage = () => {
        if (props.emailSignal[0]().length < 1) return "We only use it to sign you in.";

        return props.emailSignal[0]().includes("@") ? "" : "That does not look like an email address.";
    };

    const getPasswordMessage = () =>
        props.passwordSignal[0]().length >= MIN_PASSWORD_LENGTH ? "" : `At least ${MIN_PASSWORD_LENGTH} characters.`;

    return (
        <Form
            ariaLabel={"Sign up"}
            onSubmit={props.onSubmit}
            onReset={props.onReset}
            renderContent={(getState) => (
                <PageFormStack>
                    <FormField
                        hasError={() => getEmailMessage().includes("not look")}
                        message={getEmailMessage}
                        renderCaption={() => <PageFormFieldCaption>Email</PageFormFieldCaption>}
                        renderMessage={(getFieldState) => (
                            <PageFormFieldMessage state={getFieldState}>{getEmailMessage()}</PageFormFieldMessage>
                        )}
                        renderControl={(getFieldState) =>
                            renderTextField(props.emailSignal, () => getFieldState().hasError)
                        }
                    />

                    <FormField
                        hasError={() => getPasswordMessage().length > 0}
                        message={getPasswordMessage}
                        renderCaption={() => <PageFormFieldCaption>Password</PageFormFieldCaption>}
                        renderMessage={(getFieldState) => (
                            <PageFormFieldMessage state={getFieldState}>{getPasswordMessage()}</PageFormFieldMessage>
                        )}
                        renderControl={(getFieldState) =>
                            renderTextField(props.passwordSignal, () => getFieldState().hasError)
                        }
                    />

                    <FormField
                        dir={"row"}
                        hasError={() => !props.termsSignal[0]()}
                        message={() => (props.termsSignal[0]() ? "" : "Required.")}
                        renderCaption={() => <PageFormFieldCaption>Accept the terms</PageFormFieldCaption>}
                        renderMessage={(getFieldState) => (
                            <PageFormFieldMessage state={getFieldState}>Required.</PageFormFieldMessage>
                        )}
                        renderControl={(getFieldState) => (
                            <Checkbox
                                checkedSignal={props.termsSignal}
                                hasError={() => getFieldState().hasError}
                                renderContent={(getFlags) => <PageCheckboxContent flags={getFlags} />}
                            />
                        )}
                    />

                    <PageFormButtons>
                        <Button
                            isDisabled={() => !getState().isValid}
                            type={"submit"}
                            renderContent={(getFlags) => (
                                <PageButtonContent flags={getFlags}>Sign up</PageButtonContent>
                            )}
                        />

                        <Button
                            type={"reset"}
                            renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Reset</PageButtonContent>}
                        />
                    </PageFormButtons>
                </PageFormStack>
            )}
        />
    );
};
