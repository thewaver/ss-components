import type { Signal } from "solid-js";

export type PlanValue = "free" | "pro";

export type LabelExampleProps = {
    checkedSignal: Signal<boolean>;
};

export type LabelRadioExampleProps = {
    valueSignal: Signal<PlanValue>;
};
