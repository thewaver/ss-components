import type { Signal } from "solid-js";

export type FormExampleProps = {
    emailSignal: Signal<string>;
    passwordSignal: Signal<string>;
    termsSignal: Signal<boolean>;
    onSubmit: () => void;
    onReset: () => void;
};
