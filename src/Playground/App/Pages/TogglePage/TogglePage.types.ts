import type { Signal } from "solid-js";

export type ToggleExampleProps = {
    checkedSignal: Signal<boolean>;
};

export type ToggleMixedExampleProps = {
    allSignal: Signal<boolean>;
    firstChildSignal: Signal<boolean>;
    secondChildSignal: Signal<boolean>;
    getIsMixed: () => boolean;
};
