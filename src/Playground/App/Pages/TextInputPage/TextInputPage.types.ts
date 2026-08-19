import type { Signal } from "solid-js";

export type TextInputExampleProps = {
    valueSignal: Signal<string>;
};

export type TextInputPasswordExampleProps = TextInputExampleProps & {
    revealSignal: Signal<boolean>;
};
