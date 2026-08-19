import type { Signal } from "solid-js";

export type SizeValue = "small" | "medium" | "large";

export type RadioExampleProps = {
    valueSignal: Signal<SizeValue>;
};

export type RadioOptionalExampleProps = {
    valueSignal: Signal<SizeValue | undefined>;
};

export type RadioRatingExampleProps = {
    valueSignal: Signal<number>;
    hoveredSignal: Signal<number | undefined>;
};
