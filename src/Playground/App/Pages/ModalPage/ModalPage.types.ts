import type { Signal } from "solid-js";

export type ModalExampleProps = {
    visibilitySignal: Signal<boolean>;
};

export type ModalDestructiveExampleProps = ModalExampleProps & {
    onDecide: (outcome: string) => void;
};

export type ModalLayeredExampleProps = ModalExampleProps & {
    valueSignal: Signal<string | undefined>;
};
