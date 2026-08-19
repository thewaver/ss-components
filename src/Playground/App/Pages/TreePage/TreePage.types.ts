import type { Signal } from "solid-js";

export type Asset = {
    name: string;
    kind: string;
};

export type TreeExampleProps = {
    valueSignal: Signal<string | undefined>;
    expandedSignal: Signal<string[]>;
};

export type TreeRecordExampleProps = {
    valueSignal: Signal<Asset | undefined>;
    expandedSignal: Signal<Asset[]>;
};
