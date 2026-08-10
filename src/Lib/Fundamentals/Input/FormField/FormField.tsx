import { Show, createMemo, createUniqueId, onCleanup } from "solid-js";

import { useFormContext } from "../../Form/Form.context";
import { FormFieldContextProvider } from "./FormField.context";
import type { FormFieldProps, FormFieldState } from "./FormField.types";

import * as styles from "./FormField.css";

const DEFAULT_FORM_FIELD_DIR = "column";
const DEFAULT_FORM_FIELD_GAP = 5;

export const FormField = (props: FormFieldProps) => {
    const messageId = createUniqueId();
    const formContext = useFormContext();

    const getHasError = () => props.getHasError?.() ?? false;

    const getHasMessage = () => (props.getMessage?.() ?? "").length > 0;

    const getState = createMemo((): FormFieldState => ({ hasError: getHasError(), hasMessage: getHasMessage() }));

    if (formContext) {
        const entry = { getHasError };

        formContext.register(entry);

        onCleanup(() => formContext.unregister(entry));
    }

    return (
        <div
            class={styles.formFieldRoot}
            style={{
                "flex-direction": props.getDir?.() ?? DEFAULT_FORM_FIELD_DIR,
                "gap": `${props.getGap?.() ?? DEFAULT_FORM_FIELD_GAP}px`,
            }}
        >
            {props.renderCaption?.(getState)}

            <FormFieldContextProvider value={{ getDescriptionId: () => (getHasMessage() ? messageId : undefined) }}>
                {props.renderControl(getState)}
            </FormFieldContextProvider>

            <Show when={getHasMessage()}>
                <div id={messageId} role={getHasError() ? "alert" : undefined}>
                    {props.renderMessage?.(getState) ?? props.getMessage?.()}
                </div>
            </Show>
        </div>
    );
};
