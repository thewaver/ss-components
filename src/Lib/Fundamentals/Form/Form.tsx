import { createMemo, createSignal } from "solid-js";

import { access } from "../../Utils/propUtils";
import { FormContextProvider } from "./Form.context";
import type { FormEntry } from "./Form.context.types";
import type { FormProps, FormState } from "./Form.types";

export const Form = (props: FormProps) => {
    const [getEntries, setEntries] = createSignal<FormEntry[]>([]);
    const [getHasSubmitted, setHasSubmitted] = createSignal(false);

    const getIsValid = createMemo(() => getEntries().every((entry) => !entry.getHasError()));

    const getState = createMemo((): FormState => ({ isValid: getIsValid(), hasSubmitted: getHasSubmitted() }));

    return (
        <form
            id={access(props.id)}
            name={access(props.name)}
            aria-label={access(props.ariaLabel)}
            aria-labelledby={access(props.ariaLabelledBy)}
            noValidate
            onSubmit={(e) => {
                e.preventDefault();

                setHasSubmitted(true);

                void props.onSubmit?.();
            }}
            onReset={(e) => {
                e.preventDefault();

                setHasSubmitted(false);

                void props.onReset?.();
            }}
        >
            <FormContextProvider
                value={{
                    register: (entry) => setEntries((prev) => [...prev, entry]),
                    unregister: (entry) => setEntries((prev) => prev.filter((held) => held !== entry)),
                    getIsValid,
                    getHasSubmitted,
                }}
            >
                {props.renderContent(getState)}
            </FormContextProvider>
        </form>
    );
};
