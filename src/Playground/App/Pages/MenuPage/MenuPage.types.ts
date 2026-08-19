import type { Signal } from "solid-js";

export type Action = {
    name: string;
    shortcut?: string;
};

export type MenuExampleProps = {
    onActivate: (action: Action) => void;
};

export type MenuDrivenExampleProps = MenuExampleProps & {
    visibilitySignal: Signal<boolean>;
};
