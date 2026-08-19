import type { Signal } from "solid-js";

export type CheckboxExampleProps = {
    checkedSignal: Signal<boolean>;
};

export type CheckboxMixedExampleProps = {
    allSignal: Signal<boolean>;
    firstChildSignal: Signal<boolean>;
    secondChildSignal: Signal<boolean>;
    getIsMixed: () => boolean;
};

export type CheckboxRefusedWriteExampleProps = {
    emailSignal: Signal<boolean>;
    smsSignal: Signal<boolean>;
};
